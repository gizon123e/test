const PinaltiDistributor = require('../../models/distributor/model-pinaltiDistributor')

module.exports = {
    getAllPinaltiDistributor: async (req, res, next) => {
        try {
            const datas = await PinaltiDistributor.find()
            if (!datas) return res.status(400).json({ message: "data saat ini masi kosong" })

            res.status(200).json({
                message: "get All Data success",
                datas
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
            next(error)
        }
    }
}