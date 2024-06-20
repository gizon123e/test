const Pengemudi = require('../../models/distributor/model-pengemudi')

module.exports = {
    getPengemudiList: async (req, res, next) => {
        try {
            const dataPengemudi = await Pengemudi.find().populate("id_distributor")
            if (!dataPengemudi) return res.status(400).json({ message: "saat ini data kosong" })

            res.status(200).json({
                message: "get data success",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getPengemudiDetail: async (req, res, next) => {
        try {
            const dataPengemudi = await Pengemudi.findOne({ _id: req.params.id }).populate("id_distributor")
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: "get data success",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}