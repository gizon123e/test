const ReviewDistributor = require('../../models/model-review/model-reviewDistributor')
const Distributtor = require('../../models/distributor/model-distributor')

module.exports = {
    getAllReviewDistributor: async (req, res, next) => {
        try {
            const datas = await Distributtor.find()
            if (!datas) return res.status(400).json({ message: "data saat ini masi kosong" })

            res.status(200).json({
                message: "get All review success",
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