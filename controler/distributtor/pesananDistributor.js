const Distributtor = require("../../models/distributor/model-distributor")
const { io } = require("socket.io-client");
const Pengiriman = require("../../models/model-pengiriman");
const Product = require("../../models/model-product");
const Konsumen = require("../../models/konsumen/model-konsumen");
const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const BiayaTetap = require('../../models/model-biaya-tetap')
const PinaltiDistributor = require('../../models/distributor/model-pinaltiDistributor')

const { calculateDistance } = require('../../utils/menghitungJarak')

module.exports = {
    getAllPesananDistributor: async (req, res, next) => {
        try {
            const { status, page = 1, limit = 5 } = req.query
            const skip = (page - 1) * limit;

            let query = {
                distributorId: req.params.id
            }

            if (status) {
                query.status_distributor = { $regex: status, $options: 'i' }
            }

            const datas = await Pengiriman.find(query)
                .populate({
                    path: "orderId",
                    populate: "addressId"
                })
                .populate({
                    path: "distributorId",
                    populate: "alamat_id"
                })
                .populate({
                    path: "id_toko",
                    populate: "address"
                })
                .populate("id_jenis_kendaraan")
                .populate("jenis_pengiriman")
                .populate({
                    path: "productToDelivers.productId",
                    model: "Product",
                    populate: {
                        path: "categoryId"
                    }
                })
                .sort({ createdAt: -1 }) // Urutkan berdasarkan createdAt descending
                .skip(skip) // Lewati dokumen sesuai dengan nilai skip
                .limit(parseInt(limit));

            const payload = []
            for (let data of datas) {
                const dataKonsumen = await Konsumen.findOne({ userId: data.orderId.userId })

                payload.push({ data, konsumen: dataKonsumen })
            }

            if (!datas) return res.status(404).json({ message: "saat ini data pesanan distributor" })

            res.status(200).json({ message: "get data All success", datas: payload })
        } catch (error) {
            console.log(error)
            next(error)
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
                const distributor = await Distributtor.findOne({ _id: order.distributorId })
                const jumlahPinalti = distributor.nilai_pinalti + nilai
                await Distributtor.findByIdAndUpdate({ _id: order.distributorId }, { nilai_pinalti: jumlahPinalti }, { new: true })
            }

            console.log(`${orders.length} orders updated to "Kadaluwarsa".`);
        } catch (error) {
            console.error('Error updating order statuses:', error);
        }
    },

    ubahStatus: async (req, res, next) => {
        try {
            const { status } = req.body
            if (!status) return res.status(400).json({ message: "Tolong kirimkan status" });

            const statusAllowed = ['dikirim', 'pesanan selesai', 'dibatalkan']
            if (!statusAllowed.includes(status)) return res.status(400).json({ message: `Status tidak valid` });

            const pengiriman = await Pengiriman.findById(req.params.id).populate('orderId')
            if (!pengiriman) return res.status(404).json({ message: `Tidak ada pengiriman dengan id: ${req.params.id}` });

            const distri = await Distributtor.findById(pengiriman.distributorId)
            if (distri.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak Bisa Mengubah Pengiriman Orang Lain!" });

            if (status === "dibatalkan") {
                await Pengiriman.updateOne({ _id: req.params.id }, { rejected: true, status_distributor: "Ditolak" });

                const currentDate = new Date();
                await Distributtor.findByIdAndUpdate({ _id: distri._id }, { tolak_pesanan: distri.tolak_pesanan + 1, date_tolak: currentDate }, { new: true })
            } else {
                await Pengiriman.updateOne({ _id: req.params.id }, {
                    status_pengiriman: status
                });
            }

            const socket = io('https://probable-subtly-crawdad.ngrok-free.app', {
                auth: {
                    fromServer: true
                }
            })
            const prodIds = pengiriman.productToDelivers.map(item => {
                return item.productId
            })

            const products = await Product.find({ _id: { $in: prodIds } })
            for (const product of products) {
                socket.emit('notif_order', {
                    jenis: 'pesanan',
                    userId: pengiriman.orderId.userId,
                    message: `Pesanan ${product.name_product} telah dikirim`,
                    image: product.image_product[0],
                    status: "Pesanan dalam Pengiriman"
                })
            }
            // socket.disconnect()
            return res.status(200).json({ message: "Berhasil Mengubah Status Pengiriman" })
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

            const updateStatusDistributor = await Pengiriman.findByIdAndUpdate({ _id: req.params.id }, { status_distributor: "Diterima" })

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
