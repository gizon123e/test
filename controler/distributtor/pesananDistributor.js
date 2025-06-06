const Distributtor = require("../../models/distributor/model-distributor")
const { io } = require("socket.io-client");
const Pengiriman = require("../../models/model-pengiriman");
const Product = require("../../models/model-product");
const Konsumen = require("../../models/konsumen/model-konsumen");
const Notifikasi = require("../../models/notifikasi/notifikasi");
const DetailNotifikasi = require("../../models/notifikasi/detail-notifikasi")
const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const BiayaTetap = require('../../models/model-biaya-tetap')
const PinaltiDistributor = require('../../models/distributor/model-pinaltiDistributor')
const { Transaksi } = require('../../models/model-transaksi')

const { calculateDistance } = require('../../utils/menghitungJarak');
const Invoice = require("../../models/model-invoice");
const Vendor = require("../../models/vendor/model-vendor");
const Supplier = require("../../models/supplier/model-supplier");

function formatTanggal(tanggal) {
    const dd = String(tanggal.getDate()).padStart(2, '0');
    const mm = String(tanggal.getMonth() + 1).padStart(2, '0');
    const yyyy = tanggal.getFullYear();
    return `${yyyy}-${mm}-${dd}`
}

function formatWaktu(waktu) {
    const hh = String(waktu.getHours()).padStart(2, '0');
    const mn = String(waktu.getMinutes()).padStart(2, '0');
    const ss = String(waktu.getSeconds()).padStart(2, '0');
    return `${hh}:${mn}:${ss}`
}

module.exports = {
    getAllPesananDistributor: async (req, res, next) => {
        try {
            const { status, page = 1, limit = 5 } = req.query;
            const skip = (page - 1) * limit;

            let query = { distributorId: req.params.id };
            if (status) {
                query.status_distributor = { $regex: status, $options: 'i' };
            }

            const datas = await Pengiriman.find(query)
                .populate({
                    path: "orderId",
                    select: ['-items', '-dp', '-shipments'],
                    populate: [
                        { path: "addressId" },
                        {
                            path: "sekolahId",
                            select: ['-kelas', '-NPSN', '-userId', '-detailId', '-jumlahMurid', '-jenisPendidikan', '-statusSekolah', '-jenjangPendidikan', '-logoSekolah'],
                            populate: "address"
                        },
                        {
                            path: "userId",
                            select: ["role"],
                        }
                    ]
                })
                .populate({
                    path: "distributorId",
                    select: ['-npwp', '-file_npwp', '-imageProfile', '-jenisPerusahaan', '-tanggal_lahir', '-tolak_pesanan', '-nilai_review', '-nilai_pinalti'],
                    populate: "alamat_id"
                })
                .populate({
                    path: "id_toko",
                    select: ['-penilaian_produk', '-store_description', '-nilai_pinalti', '-waktu_operasional', '-profile_pict', '-pengikut'],
                    populate: "address"
                })
                .populate({
                    path: "id_jenis_kendaraan",
                    select: ['-description', '-ukuran', '-icon_aktif', '-icon_disable', '-icon_distributor', '-umurKendaraan']
                })
                .populate({
                    path: "jenis_pengiriman",
                    select: ['-description', '-__v']
                })
                .populate({
                    path: "productToDelivers.productId",
                    select: ['-status', '-description', '-long_description', '-pangan', '-reviews'],
                    model: "Product",
                    populate: {
                        path: "categoryId"
                    }
                })
                .lean()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            if (!datas || datas.length === 0) return res.status(404).json({ message: "Saat ini data pesanan distributor kosong" });
            const pengiriman = {}
            const foundedProduct = {}
            for (let data of datas) {
                const { productToDelivers, total_ongkir, ongkir, potongan_ongkir, ...restOfShipment } = data
                const storeId = `${data.id_toko._id.toString()}-${data.orderId._id.toString()}`
                const transaksi = await Transaksi.find({ id_pesanan: data.orderId._id });
                let detailBuyer;
                switch(data.orderId.userId.role){
                    case "vendor":
                        detailBuyer = await Vendor.findOne({userId: data.orderId.userId._id}).select("nama namaBadanUsaha").lean();
                        break;
                    case "supplier":
                        detailBuyer = await Supplier.findOne({userId: data.orderId.userId._id}).select("nama namaBadanUsaha").lean();
                        break;
                }

                const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == true)?._id, });
                const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == false)?._id, status: "Lunas" });

                productToDelivers.forEach(prod => {
                    const productId = prod.productId._id.toString();
                    if (!foundedProduct[productId]) {
                        foundedProduct[productId] = {
                            storeId,
                            productId: prod.productId,
                            quantity: 0
                        }
                    }
                    foundedProduct[productId].quantity += prod.quantity
                })

                if (data.invoice.toString() === invoiceSubsidi?._id.toString()) {
                    if (!pengiriman[storeId]) {
                        pengiriman[storeId] = {
                            ...restOfShipment,
                            detailBuyer,
                            total_ongkir: 0,
                            potongan_ongkir: 0,
                            ongkir: 0
                        }
                    }

                    pengiriman[storeId].potongan_ongkir += potongan_ongkir
                    pengiriman[storeId].total_ongkir += total_ongkir
                    pengiriman[storeId].ongkir += ongkir
                }

                if (data.invoice.toString() === invoiceTambahan?._id.toString()) {
                    if (!pengiriman[storeId]) {
                        pengiriman[storeId] = {
                            ...restOfShipment,
                            detailBuyer,
                            total_ongkir: 0,
                            potongan_ongkir: 0,
                            ongkir: 0
                        }
                    }
                    pengiriman[storeId].potongan_ongkir += potongan_ongkir
                    pengiriman[storeId].total_ongkir += total_ongkir
                    pengiriman[storeId].ongkir += ongkir
                }
            }
            const mergedProduct = Object.keys(foundedProduct).map(key => foundedProduct[key])
            const finalData = Object.keys(pengiriman).map(key => {
                let { waktu_pengiriman, createdAt, updatedAt, orderId, ...restOfPgr } = pengiriman[key]
                return {
                    ...restOfPgr,
                    orderId,
                    createdAt: orderId.createdAt.getTime() !== orderId.updatedAt.getTime() ? orderId.updatedAt : orderId.createdAt,
                    waktu_pengiriman: new Date(waktu_pengiriman),
                    products: mergedProduct.filter(prod => prod.storeId === key)
                }
            })
            return res.status(200).json({ message: "Get data All success", data: finalData });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updateOrderStatuses: async (req, res, next) => {
        try {
            const currentTime = new Date();

            const twentyFourHoursAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

            const orders = await Pengiriman.find({
                status_distributor: "Pesanan terbaru", // Ensure we only update non-expired orders
                createdAt: { $lte: twentyFourHoursAgo }
            });

            for (const order of orders) {
                const nilai = 2

                order.status_distributor = "Kadaluwarsa";
                await order.save();

                await PinaltiDistributor.create({
                    id_distributor: order.distributorId,
                    alasan_pinalti: "Tidak menerima pesanan sampai batas waktu habis",
                    poin_pinalti: nilai
                })
                // const distributor = await Distributtor.findOne({ _id: order.distributorId })
                // const jumlahPinalti = distributor.nilai_pinalti + nilai
                // await Distributtor.findByIdAndUpdate({ _id: order.distributorId }, { nilai_pinalti: jumlahPinalti }, { new: true })
            }

        } catch (error) {
            console.error('Error updating order statuses:', error);
            next(error)
        }
    },

    getByIdPengirimanDistributor: async (req, res, next) => {
        try {
            const data = await Pengiriman.findOne({ _id: req.params.id })

            if (!data) return res.status(404).json({ message: "data Not Found" })

            const dataPengiriman = await Pengiriman.find({
                orderId: data.orderId,
                kode_pengiriman: data.kode_pengiriman,
                id_toko: data.id_toko
            })
                .populate({
                    path: "orderId",
                    select: ['-items', '-dp', '-shipments'],
                    populate: [
                        { path: "addressId" },
                        {
                            path: "sekolahId",
                            select: ['-kelas', '-NPSN', '-userId', '-detailId', '-jumlahMurid', '-jenisPendidikan', '-statusSekolah', '-jenjangPendidikan', '-logoSekolah'],
                            populate: "address"
                        },
                        {
                            path: 'userId',
                            select: "role"
                        }
                    ]
                })
                .populate({
                    path: "distributorId",
                    select: ['-npwp', '-file_npwp', '-imageProfile', '-jenisPerusahaan', '-tanggal_lahir', '-tolak_pesanan', '-nilai_review', '-nilai_pinalti'],
                    populate: "alamat_id"
                })
                .populate({
                    path: "id_toko",
                    select: ['-penilaian_produk', '-store_description', '-nilai_pinalti', '-waktu_operasional', '-profile_pict', '-pengikut'],
                    populate: "address"
                })
                .populate({
                    path: "id_jenis_kendaraan",
                    select: ['-description', '-ukuran', '-icon_aktif', '-icon_disable', '-icon_distributor', '-umurKendaraan']
                })
                .populate({
                    path: "jenis_pengiriman",
                    select: ['-icon', '-description', '-__v']
                })
                .populate({
                    path: "productToDelivers.productId",
                    select: ['-status', '-description', '-long_description', '-pangan', '-reviews'],
                    model: "Product",
                    populate: {
                        path: "categoryId"
                    }
                })

            let payloadRespon = {}
            let productToDelivers = []

            for (const data of dataPengiriman) {
                const transaksi = await Transaksi.find({ id_pesanan: data.orderId._id });
                let detailBuyer;
                switch(data.orderId.userId.role){
                    case "vendor":
                        detailBuyer = await Vendor.findOne({userId: data.orderId.userId._id}).select("nama namaBadanUsaha").lean();
                        break;
                    case "supplier":
                        detailBuyer = await Supplier.findOne({userId: data.orderId.userId._id}).select("nama namaBadanUsaha").lean();
                        break;
                }

                const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == true)?._id, status: "Piutang" });
                const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == false)?._id, status: "Lunas" });

                if (data.invoice.toString() === invoiceSubsidi?._id.toString() || data.invoice.toString() === invoiceTambahan?._id.toString()) {
                    for (const item of data.productToDelivers) {
                        const existingItemIndex = productToDelivers.findIndex(ptd => ptd.productId._id.toString() === item.productId._id.toString());
                        if (existingItemIndex > -1) {
                            // Update quantity if productId already exists
                            productToDelivers[existingItemIndex].quantity += item.quantity;
                        } else {
                            // Add new item if productId doesn't exist
                            productToDelivers.push(item);
                        }
                    }
                }

                payloadRespon = {
                    id: data._id,
                    distributorId: data.distributorId._id,
                    orderId: data.orderId,
                    detailBuyer,
                    id_toko: data.id_toko,
                    waktu_pengiriman: new Date(data.waktu_pengiriman),
                    jenis_pengiriman: data.jenis_pengiriman,
                    total_ongkir: data.total_ongkir,
                    id_jenis_kendaraan: data.id_jenis_kendaraan,
                    status_pengiriman: data.status_pengiriman,
                    kode_pengiriman: data.kode_pengiriman,
                    status_distributor: data.status_distributor,
                    productToDelivers
                }
            }

            res.status(200).json({
                message: 'get data by id success',
                data: payloadRespon
            })

        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }

            next(error);
        }
    },

    updateDiTerimaDistributor: async (req, res, next) => {
        try {
            const { id_toko, distributorId, orderId, kode_pengiriman, status, id_pengiriman } = req.body
            const biayaTetap = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" })

            if (!status) return res.status(400).json({ message: 'status harus di isi' })

            const dataPengiriman = await Pengiriman.findOne({ _id: id_pengiriman, id_toko, distributorId, orderId, kode_pengiriman })
                .populate({
                    path: "orderId",
                    populate: "addressId"
                })
                .populate({
                    path: "id_toko",
                    populate: "address"
                })

            if (!dataPengiriman) return res.status(404).json({ message: "data Not Found" })

            const longAlamatKonsumen = parseFloat(dataPengiriman.orderId.addressId.pinAlamat.long)
            const latKAlamatKonsumen = parseFloat(dataPengiriman.orderId.addressId.pinAlamat.lat)

            const longTokoVendorAddress = parseFloat(dataPengiriman.id_toko.address.pinAlamat.long)
            const latTokoVendorAddress = parseFloat(dataPengiriman.id_toko.address.pinAlamat.lat)

            const nilaiJarak = await calculateDistance(latTokoVendorAddress, longTokoVendorAddress, latKAlamatKonsumen, longAlamatKonsumen, biayaTetap.radius);
            const jarakOngkir = nilaiJarak.toFixed(2)

            const timeInSeconds = (jarakOngkir / biayaTetap.rerata_kecepatan) * 3600; // cari hitungan detik

            const payLoadDataPengiriman = await Pengiriman.find({ id_toko, distributorId, orderId, kode_pengiriman })
                .populate({
                    path: "orderId",
                    select: ['-items', '-dp', '-shipments'],
                    populate: [
                        { path: "addressId" },
                        {
                            path: "sekolahId",
                            select: ['-kelas', '-NPSN', '-userId', '-detailId', '-jumlahMurid', '-jenisPendidikan', '-statusSekolah', '-jenjangPendidikan', '-logoSekolah'],
                            populate: "address"
                        },
                        {
                            path: 'userId',
                            select: "role"
                        }
                    ]
                })
                .populate({
                    path: "distributorId",
                    select: ['-npwp', '-file_npwp', '-imageProfile', '-jenisPerusahaan', '-tanggal_lahir', '-tolak_pesanan', '-nilai_review', '-nilai_pinalti'],
                    populate: "alamat_id"
                })
                .populate({
                    path: "id_toko",
                    select: ['-penilaian_produk', '-store_description', '-nilai_pinalti', '-waktu_operasional', '-profile_pict', '-pengikut'],
                    populate: "address"
                })
                .populate({
                    path: "id_jenis_kendaraan",
                    select: ['-description', '-ukuran', '-icon_aktif', '-icon_disable', '-icon_distributor', '-umurKendaraan']
                })
                .populate({
                    path: "jenis_pengiriman",
                    select: ['-icon', '-description', '-__v']
                })
                .populate({
                    path: "productToDelivers.productId",
                    select: ['-status', '-description', '-long_description', '-pangan', '-reviews'],
                    model: "Product",
                    populate: {
                        path: "categoryId"
                    }
                })

            let productToDelivers = []
            let tarif_pengiriman = 0
            let dataCreate = {}
            for (const data of payLoadDataPengiriman) {
                if(data.orderId.userId.role === "vendor"){
                    const vendor = await Vendor.exists({userId: data.orderId.userId._id});
                    dataCreate = {
                        buyerId: vendor._id,
                        buyerType: "Vendor"
                    }
                }

                if(data.orderId.userId.role === "supplier"){
                    const supplier = await Supplier.exists({userId: data.orderId.userId._id});
                    dataCreate = {
                        buyerId: supplier._id,
                        buyerType: "Supplier"
                    }
                }

                if(data.orderId.sekolahId){
                    dataCreate = {
                        buyerId: data.orderId.sekolahId,
                        buyerType: "Sekolah"
                    }
                }

                const transaksi = await Transaksi.find({ id_pesanan: data.orderId._id });

                const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == true)?._id, status: "Piutang" });
                const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == false)?._id, status: "Lunas" });

                if (data.invoice.toString() === invoiceSubsidi?._id.toString() || data.invoice.toString() === invoiceTambahan?._id.toString()) {
                    tarif_pengiriman += data.total_ongkir
                    for (const item of data.productToDelivers) {
                        const existingItemIndex = productToDelivers.findIndex(ptd => ptd.productId._id.toString() === item.productId._id.toString());
                        if (existingItemIndex > -1) {
                            // Update quantity if productId already exists
                            productToDelivers[existingItemIndex].quantity += item.quantity;
                        } else {
                            // Add new item if productId doesn't exist
                            productToDelivers.push(item);
                        }
                    }
                }
            }

            let total_berat = 0
            for (const data of productToDelivers) {
                const hitunganKg = data.productId.berat / 1000
                const totalBeratProduct = hitunganKg * data.quantity
                total_berat += totalBeratProduct
            }

            const dataDistributor = await Distributtor.findOne({ _id: distributorId })

            if (status === "Ditolak" && dataPengiriman.status_distributor === 'Diterima') {
                await Pengiriman.updateMany({ id_toko, distributorId, orderId, kode_pengiriman }, { rejected: true, status_distributor: "Ditolak" });
                await PinaltiDistributor.create({
                    id_distributor: distributorId,
                    alasan_pinalti: "membatalkan pengiriman setelah konfirmasi (terima)s",
                    poin_pinalti: 3
                })

                await ProsesPengirimanDistributor.deleteOne({ distributorId, kode_pengiriman: kode_pengiriman, pengirimanId: id_pengiriman })

                const currentDate = new Date();
                await Distributtor.findByIdAndUpdate({ _id: dataPengiriman.distributorId }, { tolak_pesanan: dataDistributor.tolak_pesanan + 1, date_tolak: currentDate }, { new: true })

            } else if (status === "Ditolak") {
                await Pengiriman.updateMany({ id_toko, distributorId, orderId, kode_pengiriman }, { rejected: true, status_distributor: "Ditolak" });

                const currentDate = new Date();
                await Distributtor.findByIdAndUpdate({ _id: dataPengiriman.distributorId }, { tolak_pesanan: dataDistributor.tolak_pesanan + 1, date_tolak: currentDate }, { new: true })
            } else {
                await Pengiriman.updateMany({ id_toko, distributorId, orderId, kode_pengiriman }, { status_distributor: status, });
                const finalDataCreate = {
                    ...dataCreate,
                    distributorId: dataPengiriman.distributorId,
                    tokoId: dataPengiriman.id_toko._id,
                    tokoType: dataPengiriman.tokoType,
                    pengirimanId: payLoadDataPengiriman.map(pgr => pgr._id),
                    jarakPengiriman: jarakOngkir,
                    jenisPengiriman: dataPengiriman.jenis_pengiriman,
                    optimasi_pengiriman: timeInSeconds !== NaN? timeInSeconds : 0,
                    kode_pengiriman: dataPengiriman.kode_pengiriman,
                    tarif_pengiriman: tarif_pengiriman,
                    produk_pengiriman: productToDelivers,
                    jenisKendaraan: dataPengiriman.id_jenis_kendaraan,
                    potongan_ongkir: dataPengiriman.potongan_ongkir,
                    waktu_pengiriman: new Date(dataPengiriman.waktu_pengiriman),
                    total_berat: total_berat
                }

                await ProsesPengirimanDistributor.create(finalDataCreate)
            }
            res.status(201).json({ message: "update data success" })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    updatePelanggaranDistributor: async (req, res, next) => {
        try {
            const currentTime = new Date();
            const twentyFourHoursAgo = new Date(currentTime.getTime() - 23 * 60 * 60 * 1000);
            const dataRisertAnkaPelanggaran = await Distributtor.find({
                date_tolak: { $lte: twentyFourHoursAgo }
            })

            for (let id of dataRisertAnkaPelanggaran) {
                await Distributtor.updateOne({ _id: id._id }, { tolak_pesanan: 0 })
            }

        } catch (error) {
            console.error('Error updating pelanggaran distributor statuses:', error);
        }
    }
}
