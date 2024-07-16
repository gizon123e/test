const ReviewDistributor = require('../../models/distributor/model-reviewDistributor')
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
    },

    createReviewDistributor: async (req, res, next) => {
        try {
            const { id_distributor, nilai_review } = req.body

            const dataDistributor = await Distributtor.findOne({ _id: id_distributor })
            if (!dataDistributor) return res.status(404).json({ message: "data Not Found" })

            const reviewDistributor = await ReviewDistributor.find({ id_distributor })
            const indexReview = reviewDistributor.length + 1

            const nilaiReview = dataDistributor.nilai_review + nilai_review
            let numberTotalReview
            if (indexReview > 0) {
                const penguranganNilai = nilaiReview - dataDistributor.nilai_pinalti
                numberTotalReview = penguranganNilai / indexReview
            } else {
                const penguranganNilai = nilaiReview - dataDistributor.nilai_pinalti
                numberTotalReview = penguranganNilai / 1
            }

            await Distributtor.findOneAndUpdate({ _id: id_distributor }, { nilai_review: numberTotalReview })

            const dataReview = await ReviewDistributor.create({ id_distributor, nilai_review, userId: req.user.id })

            res.status(201).json({
                message: "create data success",
                data: dataReview
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