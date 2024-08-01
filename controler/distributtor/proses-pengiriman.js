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

    updateStatusProsesPengiriman: async (req, res, next) => {
        try {
            const pengiriman = await Pengiriman.findOne({ _id: req.params.pengirimanId })
            if (!pengiriman) return res.status(404).json({ message: "data pengiriman not found" })

            const prosesPengiriman = await ProsesPengirimanDistributor.findOne({ _id: req.params.prosesPengirimanId })
            if (!prosesPengiriman) return res.status(404).json({ message: "data prosesPengiriman not found" })

            await Pengiriman.findByIdAndUpdate({ _id: req.params.pengirimanId }, { status_pengiriman: "dikirim" })

            const data = await ProsesPengirimanDistributor.findByIdAndUpdate({ _id: req.params.prosesPengirimanId }, { status_distributor: "Sedang dijemput" })
            await PelacakanDistributorKonsumen.create({
                id_toko: prosesPengiriman.tokoId,
                id_kosumen: prosesPengiriman.konsumenId,
                id_distributor: prosesPengiriman.distributorId,
                id_pesanan: prosesPengiriman._id,
                pesanan_diserahkan_konsumen: 'Pesanan diserahkan ke distributor'
            })

            res.status(201).json({
                message: "update data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}