const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")

module.exports = {
    getAllProsesPengiriman: async (req, res, next) => {
        try {
            const dataProsesPengirimanDistributor = await ProsesPengirimanDistributor.find()
                .populate({
                    path: "tokoId",
                    populate: "address"
                })
                .populate({
                    path: "konsumenId",
                    populate: "address"
                })
                .populate("jenisPengiriman")
                .populate("jenisKendaraan")

            if (!dataProsesPengirimanDistributor) return res.status(400).json({ message: "data saat ini masi kosong" })

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
    }
}