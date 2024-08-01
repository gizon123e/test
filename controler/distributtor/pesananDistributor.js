const Distributtor = require("../../models/distributor/model-distributor")
const { io } = require("socket.io-client");
const Pengiriman = require("../../models/model-pengiriman");
const Product = require("../../models/model-product");
const Konsumen = require("../../models/konsumen/model-konsumen");
const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const BiayaTetap = require('../../models/model-biaya-tetap')
const PinaltiDistributor = require('../../models/distributor/model-pinaltiDistributor')
const { Transaksi } = require('../../models/model-transaksi')

const { calculateDistance } = require('../../utils/menghitungJarak');
const Invoice = require("../../models/model-invoice");

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
                .sort({ createdAt: -1 })
            // .skip(skip)
            // .limit(parseInt(limit));

            if (!datas || datas.length === 0) return res.status(404).json({ message: "Saat ini data pesanan distributor kosong" });

            const dataPayload = []
            const productArray = []
            const uniqueOrders = new Map();
            console.log(datas.length)
            // Gather all order IDs
            const dataPengiriman = []
            const pengiriman = {}
            for (let data of datas) {
                const dataKonsumen = await Konsumen.findOne({ userId: data.orderId.userId })
                    .select('-nilai_review -file_ktp -nik -namaBadanUsaha -nomorAktaPerusahaan -npwpFile -nomorNpwpPerusahaan -nomorNpwp -profile_pict -jenis_kelamin -legalitasBadanUsaha -tanggal_lahir');
                const uniqueKey = `${data.orderId._id}_${data.id_toko}_${data._id}`;
                const transaksi = await Transaksi.find({ id_pesanan: data.orderId._id });

                const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == true)._id, });
                const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == false)._id, status: "Lunas" });
                console.log(data.id_toko)
                if (data.invoice.toString() === invoiceSubsidi?._id.toString()) {
                    if (uniqueOrders.has(uniqueKey)) {
                        let existingOrder = uniqueOrders.get(uniqueKey);
                        existingOrder.data.productToDelivers = mergeProductToDelivers(existingOrder.data.productToDelivers, data.productToDelivers);
                    } else {
                        uniqueOrders.set(uniqueKey, { data, konsumen: dataKonsumen });
                    }
                }

                if (data.invoice.toString() === invoiceTambahan?._id.toString()) {
                    console.log('masuk tambahan')

                    if (uniqueOrders.has(uniqueKey)) {
                        let existingOrder = uniqueOrders.get(uniqueKey);
                        // Merge productToDelivers
                        existingOrder.data.productToDelivers = mergeProductToDelivers(existingOrder.data.productToDelivers, data.productToDelivers);
                    } else {
                        uniqueOrders.set(uniqueKey, { data, konsumen: dataKonsumen });
                    }
                }
            }

            const payload = Array.from(uniqueOrders.values());

            return res.status(200).json({ message: "Get data All success", datas: payload });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updateOrderStatuses: async () => {
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

            console.log(`${orders.length} orders updated to "Kadaluwarsa".`);
        } catch (error) {
            console.error('Error updating order statuses:', error);
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

                const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == true)._id, status: "Piutang" });
                // const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == false)._id, status: "Lunas" });
                const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi.find(tr => tr.subsidi == false), status: "Lunas" });
                // console.log('invoice subsidi', invoiceSubsidi)
                console.log('invoice tidak subsidi', invoiceTambahan)

                // if (data.invoice.toString() === invoiceSubsidi?._id.toString() ) {
                //     if (data.invoice.toString() === invoiceTambahan?._id.toString()) {
                //         console.log('invoice tambahan')
                //         console.log('pesanan id invoice', data.invoice.toString())
                //         productToDelivers = data.productToDelivers

                //     } else {
                //         console.log('invoice subsidi')
                //         console.log('pesanan id invoice', data.invoice.toString())
                //         productToDelivers = data.productToDelivers
                //     }
                // }


                if (data.invoice.toString() === invoiceSubsidi?._id.toString() || data.invoice.toString() === invoiceTambahan?._id.toString()) {
                    for (const item of data.productToDelivers) {
                        productToDelivers.push(item)
                    }
                }

                payloadRespon = {
                    orderId: data.orderId,
                    id_toko: data.id_toko,
                    waktu_pengiriman: data.waktu_pengiriman,
                    jenis_pengiriman: data.jenis_pengiriman,
                    total_ongkir: data.total_ongkir,
                    id_jenis_kendaraan: data.id_jenis_kendaraan,
                    status_pengiriman: data.status_pengiriman,
                    kode_pengiriman: data.kode_pengiriman,
                    status_distributor: data.status_distributor
                }
            }

            res.status(200).json({
                message: 'get data by id success',
                data: productToDelivers
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

    ubahStatus: async (req, res, next) => {
        try {
            const { status, tokoId, kode_pengiriman, distributorId } = req.body
            if (!status) return res.status(400).json({ message: "Tolong kirimkan status" });

            const statusAllowed = ['dikirim', 'pesanan diterima', 'dibatalkan']
            if (!statusAllowed.includes(status)) return res.status(400).json({ message: `Status tidak valid` });

            let query = {
                orderId: req.params.id,
                id_toko: tokoId,
                kode_pengiriman,
                distributorId
            }

            const pengiriman = await Pengiriman.find(query)
                .populate({
                    path: "orderId",
                    populate: "addressId"
                })
                .populate({
                    path: "id_toko",
                    populate: "address"
                });

            if (!pengiriman || pengiriman.length === 0) return res.status(404).json({ message: `Tidak ada pengiriman` });

            const pengirimanIds = pengiriman.map(pgr => pgr._id)
            const distriIds = pengiriman.map(pgr => pgr.distributorId)
            console.log(distriIds)

            const distri = await Distributtor.findById(distributorId)
            if (distri.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak Bisa Mengubah Pengiriman Orang Lain!" });

            if (status === "dibatalkan") {
                await Pengiriman.updateMany({ _id: { $in: pengirimanIds } }, { rejected: true, status_distributor: "Ditolak" });

                const currentDate = new Date();
                await Distributtor.updateMany({ _id: { $in: distriIds } }, { tolak_pesanan: distri.tolak_pesanan + 1, date_tolak: currentDate }, { new: true })
            } else {
                await Pengiriman.updateMany({ _id: { $in: pengirimanIds } }, {
                    status_pengiriman: status
                });
            }

            return res.status(200).json({ message: "Berhasil Mengubah Status Pengiriman", pengirimanIds })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    updateDiTerimaDistributor: async (req, res, next) => {
        try {
            const dataPengiriman = await Pengiriman.findOne({ _id: req.params.id })
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

            const nilaiJarak = calculateDistance(latTokoVendorAddress, longTokoVendorAddress, latKAlamatKonsumen, longAlamatKonsumen, 100);
            const jarakOngkir = nilaiJarak.toFixed(2)

            const biayaTetap = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" })
            const timeInSeconds = (jarakOngkir / biayaTetap.rerata_kecepatan) * 3600; // cari hitungan detik

            const dataKonsumen = await Konsumen.findOne({ userId: dataPengiriman.orderId.userId })

            const payloadProduk = []
            for (const id of dataPengiriman.productToDelivers) {
                payloadProduk.push({
                    produkId: id.productId,
                    quantity: id.quantity
                })
            }

            const createProsesPengiriman = await ProsesPengirimanDistributor.create({
                distributorId: dataPengiriman.distributorId,
                konsumenId: dataKonsumen._id,
                tokoId: dataPengiriman.id_toko._id,
                jarakPengiriman: jarakOngkir,
                jenisPengiriman: dataPengiriman.jenis_pengiriman,
                optimasi_pengiriman: timeInSeconds,
                kode_pengiriman: dataPengiriman.kode_pengiriman,
                tarif_pengiriman: dataPengiriman.total_ongkir,
                produk_pengiriman: payloadProduk,
                waktu_pesanan: dataPengiriman.orderId.items[0].deadline,
                jenisKendaraan: dataPengiriman.id_jenis_kendaraan
            })

            const socket = io('https://staging-backend.superdigitalapps.my.id', {
                auth: {
                    fromServer: true
                }
            })
            const prodIds = dataPengiriman.flatMap(pgr => {
                return pgr.productToDelivers.map(item => item.productId);
            });

            if (status === "dibatalkan") {
                await Pengiriman.updateMany({ _id: req.params.id }, { rejected: true, status_distributor: "Ditolak" });

                const currentDate = new Date();
                await Distributtor.updateMany({ _id: dataPengiriman.distributorId }, { tolak_pesanan: distri.tolak_pesanan + 1, date_tolak: currentDate }, { new: true })
            } else {
                await Pengiriman.updateMany({ _id: req.params.id }, {
                    status_pengiriman: status
                });
            }

            const products = await Product.find({ _id: { $in: prodIds } })
            for (const product of products) {
                socket.emit('notif_order', {
                    jenis: 'pesanan',
                    userId: dataPengiriman.orderId.userId,
                    message: `Pesanan ${product.name_product} telah dikirim`,
                    image: product.image_product[0],
                    status: "Pesanan dalam Pengiriman"
                })
            }

            const updateStatusDistributor = await Pengiriman.findByIdAndUpdate({ _id: req.params.id }, { status_distributor: "Dikirim" })

            res.status(201).json({
                message: "update data success",
                dataConfirmasiDistributor: updateStatusDistributor,
                dataProsesPengirimanDistributor: createProsesPengiriman
            })
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

            console.log(`${dataRisertAnkaPelanggaran.length} distributor violations reset to 0.`);
        } catch (error) {
            console.error('Error updating pelanggaran distributor statuses:', error);
        }
    }
}
