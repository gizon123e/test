const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const Pengiriman = require('../../models/model-pengiriman')
const PelacakanDistributorKonsumen = require('../../models/distributor/pelacakanDistributorKonsumen')
const Distributtor = require('../../models/distributor/model-distributor')
const { Transaksi } = require('../../models/model-transaksi')
const Invoice = require('../../models/model-invoice')
const Notifikasi = require('../../models/notifikasi/notifikasi')
const DetailNotifikasi = require('../../models/notifikasi/detail-notifikasi')
const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

const { io } = require("socket.io-client");

const socket = io('http://localhost:5000', {
    auth: {
        fromServer: true
    }
})

function formatTanggal(tanggal) {
    const dd = String(tanggal.getDate()).padStart(2, '0');
    const mm = String(tanggal.getMonth() + 1).padStart(2, '0');
    const yyyy = tanggal.getFullYear();
    return `${yyyy}-${mm}-${dd}`
}

module.exports = {
    getAllProsesPengiriman: async (req, res, next) => {
        try {
            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: 'data not FOund' })

            const dataProsesPengirimanDistributor = await ProsesPengirimanDistributor.find({ distributorId: distributor._id })
                .populate({
                    path: "tokoId",
                    populate: "address"
                })
                .populate({
                    path: "sekolahId",
                    populate: "address"
                })
                .populate("jenisPengiriman")
                .populate("jenisKendaraan")
                .populate({
                    path: "produk_pengiriman.productId",
                    populate: "categoryId"
                })

            if (!dataProsesPengirimanDistributor || dataProsesPengirimanDistributor.length === 0) return res.status(400).json({ message: "data saat ini masi kosong" })

            res.status(200).json({
                message: "data get All success",
                datas: dataProsesPengirimanDistributor
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getDetailProsesPengiriman: async (req, res, next) => {
        try {
            const dataProsesPengirimanDistributor = await ProsesPengirimanDistributor.findOne({ _id: req.params.id })
                .populate({
                    path: "tokoId",
                    populate: "address"
                })
                .populate({
                    path: "konsumenId",
                    populate: "address"
                })
                .populate("jenisPengiriman")
                .populate({ path: "produk_pengiriman.produkId" }).
                populate("jenisKendaraan")

            if (!dataProsesPengirimanDistributor) return res.status(404).json({ message: "Data Not Found" })

            res.status(200).json({
                message: "get detail success",
                data: dataProsesPengirimanDistributor
            })

        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    mulaiPenjemputan: async (req, res, next) => {
        try {
            const { id_toko, id_address, latitude, longitude, id_distributor, id_pesanan, id_konsumen, } = req.body

            const distri = await Distributtor.exists({ userId: req.user.id })

            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({ _id: req.params.id, distributorId: distri._id }, { status_distributor: "Sedang dijemput" }, { new: true });

            await Pengiriman.updateOne(
                { _id: prosesPengiriman.pengirimanId },
                { status_pengiriman: "dikirim" }
            )

            await PelacakanDistributorKonsumen.create({
                id_toko,
                id_address,
                latitude,
                longitude,
                id_distributor,
                id_pesanan,
                id_konsumen,
                statusPengiriman: 'Pesanan diserahkan ke distributor'
            })


            if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

            return res.status(200).json({ message: "Berhasil Memulai Penjemputan" });
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    sudahDiJemput: async (req, res, next) => {
        try {
            if (!total_qty || !ketersediaan) return res.status(400).json({ message: "data total_qty & ketersediaan harus di isi" })

            const distri = await Distributtor.exists({ userId: req.user.id })
            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({ _id: req.params.id, distributorId: distri._id }, { status_distributor: "Sudah dijemput" }, { new: true }).populate('pengirimanId').populate('produk_pengiriman.productId');
            const invoice = await Transaksi.aggregate([
                { $match: { id_pesanan: new mongoose.Types.ObjectId(prosesPengiriman.pengirimanId.orderId) } },
                { $project: { _id: 1 } },
                {
                    $lookup: {
                        from: "invoices",
                        let: { id_transaksi: "$_id" },
                        pipeline: [{ $match: { $expr: { $eq: ["$id_transaksi", "$$id_transaksi"] } } }],
                        as: 'invoice'
                    }
                },
                { $unwind: "$invoice" }
            ])

            if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });
            // console.log(invoice.length)
            if (invoice.length == 1) {
                const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id })
                const detailNotifikasi = await DetailNotifikasi.create({
                    notifikasiId: notifikasi._id,
                    status: "Pesanan telah diserahkan ke jasa pengiriman",
                    jenis: "Pesanan",
                    message: `${invoice[0].invoice.kode_invoice} telah diserahkan ke jasa pengiriman dan akan segera diantar menuju alamat tujuan`,
                    image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
                    createdAt: new Date()

                })
                socket.emit('notif_pesanan_diserahkan', {
                    jenis: detailNotifikasi.jenis,
                    userId: notifikasi.userId,
                    status: detailNotifikasi.status,
                    message: detailNotifikasi.message,
                    image: detailNotifikasi.image_product,
                    tanggal: formatTanggal(detailNotifikasi.createdAt)
                })
                return res.status(200).json({ message: "Berhasil Menerima Penjemputan" });
            } else {
                for (const item of invoice) {
                    const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id })
                    const detailNotifikasi = await DetailNotifikasi.create({
                        notifikasiId: notifikasi._id,
                        status: "Pesanan telah diserahkan ke jasa pengiriman",
                        jenis: "Pesanan",
                        message: `${item.invoice.kode_invoice} telah diserahkan ke jasa pengiriman dan akan segera diantar menuju alamat tujuan`,
                        image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
                        createdAt: new Date()

                    })
                    socket.emit('notif_pesanan_diserahkan', {
                        jenis: detailNotifikasi.jenis,
                        userId: notifikasi.userId,
                        status: detailNotifikasi.status,
                        message: detailNotifikasi.message,
                        image: detailNotifikasi.image_product,
                        tanggal: formatTanggal(detailNotifikasi.createdAt)
                    })
                }
                return res.status(200).json({ message: "Berhasil Menerima Penjemputan" });
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    mulaiPengiriman: async (req, res, next) => {
        try {
            const { id_toko, id_address, latitude, longitude, id_distributor, id_pesanan, id_konsumen, total_qty, ketersediaan } = req.body

            await PelacakanDistributorKonsumen.create({
                id_toko,
                id_address,
                latitude,
                longitude,
                id_distributor,
                id_pesanan,
                id_konsumen,
                statusPengiriman: 'Pesanan sedang dalam perjalanan',
                total_qty,
                ketersediaan
            })

            const distri = await Distributtor.exists({ userId: req.user.id })
            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({ _id: req.params.id, distributorId: distri._id }, { status_distributor: "Sedang dikirim" }, { new: true }).populate('pengirimanId').populate('produk_pengiriman.productId');
            const invoice = await Transaksi.aggregate([
                { $match: { id_pesanan: new mongoose.Types.ObjectId(prosesPengiriman.pengirimanId.orderId) } },
                {
                    $lookup: {
                        from: "invoices",
                        let: { id_transaksi: "$_id" },
                        pipeline: [{ $match: { $expr: { $eq: ["$id_transaksi", "$$id_transaksi"] } } }],
                        as: 'invoice'
                    }
                },
                { $unwind: "$invoice" }
            ])
            if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });
            // const notifikasi = await Notifikasi.findOne({invoiceId: transaksi[0].invoice._id})
            // const detailNotifikasi = await DetailNotifikasi.create({
            //     notifikasiId: notifikasi._id,
            //     status: "Pesanan sedang dalam pengiriman",
            //     jenis: "Pesanan",
            //     message: `${transaksi[0].invoice.kode_invoice} sedang dalam perjalanan ke alamat tujuan`,
            //     image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
            //     createdAt: new Date()

            // })
            // socket.emit('notif_pesanan_dikirim', {
            //     jenis: detailNotifikasi.jenis,
            //     userId: notifikasi.userId,
            //     status: detailNotifikasi.status,
            //     message: detailNotifikasi.message,
            //     image: detailNotifikasi.image_product,
            //     tanggal: formatTanggal(detailNotifikasi.createdAt)
            // })  
            // if(!prosesPengiriman) return res.status(404).json({message: "Proses pengiriman tidak ditemukan"});
            // return res.status(200).json({message: "Berhasil Memulai Pengiriman"});
            if (invoice.length == 1) {
                const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id })
                const detailNotifikasi = await DetailNotifikasi.create({
                    notifikasiId: notifikasi._id,
                    status: "Pesanan sedang dalam pengiriman",
                    jenis: "Pesanan",
                    message: `${invoice[0].invoice.kode_invoice} sedang dalam perjalanan ke alamat tujuan`,
                    image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
                    createdAt: new Date()

                })
                socket.emit('notif_pesanan_dikirim', {
                    jenis: detailNotifikasi.jenis,
                    userId: notifikasi.userId,
                    status: detailNotifikasi.status,
                    message: detailNotifikasi.message,
                    image: detailNotifikasi.image_product,
                    tanggal: formatTanggal(detailNotifikasi.createdAt)
                })
                return res.status(200).json({ message: "Berhasil Memulai Pengiriman" });
            } else {
                for (const item of invoice) {
                    const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id })
                    const detailNotifikasi = await DetailNotifikasi.create({
                        notifikasiId: notifikasi._id,
                        status: "Pesanan sedang dalam pengiriman",
                        jenis: "Pesanan",
                        message: `${item.invoice.kode_invoice} sedang dalam perjalanan ke alamat tujuan`,
                        image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
                        createdAt: new Date()

                    })
                    socket.emit('notif_pesanan_dikirim', {
                        jenis: detailNotifikasi.jenis,
                        userId: notifikasi.userId,
                        status: detailNotifikasi.status,
                        message: detailNotifikasi.message,
                        image: detailNotifikasi.image_product,
                        tanggal: formatTanggal(detailNotifikasi.createdAt)
                    })
                }
                return res.status(200).json({ message: "Berhasil Memulai Pengiriman" });
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    pesasanSelesai: async (req, res, next) => {
        try {
            const { id_toko, id_address, latitude, longitude, id_distributor, id_pesanan, id_konsumen, } = req.body
            const files = req.files
            const images = files ? files.images : null;

            const imageNameProfile = `${Date.now()}${path.extname(imageProfile.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/pengiriman', images);

            await images.mv(imagePathProfile);

            await PelacakanDistributorKonsumen.updateMany({
                id_toko,
                id_address,
                latitude,
                longitude,
                id_distributor,
                id_pesanan,
                id_konsumen,
            }, {
                image_pengiriman: `${process.env.HOST}public/pengiriman/${imageNameProfile}`
            })

            const distri = await Distributtor.exists({ userId: req.user.id })
            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({ _id: req.params.id, distributorId: distri._id }, { status_distributor: "Selesai" }, { new: true }).populate('pengirimanId').populate('produk_pengiriman.productId');
            if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

            await Pengiriman.updateOne(
                { _id: prosesPengiriman.pengirimanId },
                { status_pengiriman: "pesanan selesai" }
            )

            const invoice = await Transaksi.aggregate([
                { $match: { id_pesanan: new mongoose.Types.ObjectId(prosesPengiriman.pengirimanId.orderId) } },
                {
                    $lookup: {
                        from: "invoices",
                        let: { id_transaksi: "$_id" },
                        pipeline: [{ $match: { $expr: { $eq: ["$id_transaksi", "$$id_transaksi"] } } }],
                        as: 'invoice'
                    }
                },
                { $unwind: "$invoice" }
            ])
            if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

            if (invoice.length == 1) {
                const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id })
                const detailNotifikasi = await DetailNotifikasi.create({
                    notifikasiId: notifikasi._id,
                    status: "Pesanan telah diterima oleh konsumen",
                    jenis: "Pesanan",
                    message: `${invoice[0].invoice.kode_invoice} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
                    image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
                    createdAt: new Date()

                })
                socket.emit('notif_pesanan_diterima', {
                    jenis: detailNotifikasi.jenis,
                    userId: notifikasi.userId,
                    status: detailNotifikasi.status,
                    message: detailNotifikasi.message,
                    image: detailNotifikasi.image_product,
                    tanggal: formatTanggal(detailNotifikasi.createdAt)
                })
                return res.status(200).json({ message: "Berhasil Menyelesaikan Pengiriman" });
            } else {
                for (const item of invoice) {
                    const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id })
                    const detailNotifikasi = await DetailNotifikasi.create({
                        notifikasiId: notifikasi._id,
                        status: "Pesanan telah diterima oleh konsumen",
                        jenis: "Pesanan",
                        message: `${item.invoice.kode_invoice} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
                        image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
                        createdAt: new Date()

                    })
                    socket.emit('notif_pesanan_diterima', {
                        jenis: detailNotifikasi.jenis,
                        userId: notifikasi.userId,
                        status: detailNotifikasi.status,
                        message: detailNotifikasi.message,
                        image: detailNotifikasi.image_product,
                        tanggal: formatTanggal(detailNotifikasi.createdAt)
                    })
                }
                return res.status(200).json({ message: "Berhasil Menyelesaikan Pengiriman" });
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}