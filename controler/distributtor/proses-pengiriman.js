const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const Pengiriman = require('../../models/model-pengiriman')
const PelacakanDistributorKonsumen = require('../../models/distributor/pelacakanDistributorKonsumen')
const Distributtor = require('../../models/distributor/model-distributor')

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

    mulaiPenjemputan: async(req, res, next) => {
        try {
            const distri = await Distributtor.exists({userId: req.user.id})
            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({_id: req.params.id, distributorId: distri._id}, { status_distributor: "Sedang dijemput"}, {new: true});
            await Pengiriman.updateOne(
                { _id: prosesPengiriman.pengirimanId },
                { status_pengiriman: "dikirim" }
            )
            if(!prosesPengiriman) return res.status(404).json({message: "Proses pengiriman tidak ditemukan"});
            return res.status(200).json({message: "Berhasil Memulai Penjemputan"});
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    sudahDiJemput: async(req, res, next) => {
        try {
            const distri = await Distributtor.exists({userId: req.user.id})
            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({_id: req.params.id, distributorId: distri._id}, { status_distributor: "Sudah dijemput"}, {new: true});
            if(!prosesPengiriman) return res.status(404).json({message: "Proses pengiriman tidak ditemukan"});
            return res.status(200).json({message: "Berhasil Menerima Penjemputan"});
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    mulaiPengiriman: async(req, res, next) => {
        try {
            const distri = await Distributtor.exists({userId: req.user.id})
            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({_id: req.params.id, distributorId: distri._id}, { status_distributor: "Sedang dikirim"}, {new: true});
            if(!prosesPengiriman) return res.status(404).json({message: "Proses pengiriman tidak ditemukan"});
            return res.status(200).json({message: "Berhasil Memulai Pengiriman"});
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    pesasanSelesai: async(req, res, next) => {
        try {
            // const { bukti_pengiriman } = req.files
            const distri = await Distributtor.exists({userId: req.user.id})
            const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({_id: req.params.id, distributorId: distri._id}, { status_distributor: "Selesai"}, {new: true});
            if(!prosesPengiriman) return res.status(404).json({message: "Proses pengiriman tidak ditemukan"});
            await Pengiriman.updateOne(
                { _id: prosesPengiriman.pengirimanId },
                { status_pengiriman: "pesanan selesai" }
            )
            return res.status(200).json({message: "Berhasil Menyelesaikan Pengiriman"});
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}