const ReviewPengguna = require('../../models/vendor/model-reviewVendor')
const Konsumen = require('../../models/konsumen/model-konsumen')

module.exports = {
    getAllReviewKonsumen: async (req, res, next) => {
        try {
            const datas = await ReviewPengguna.find()
            if (!datas) return res.status(400).json({ message: "saat ini data masi kosong" })

            res.status(200).json({
                message: "get data all success",
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

    createDataReviewKonsumen: async (req, res, next) => {
        try {
            const { id_konsumen, nilai_review, komentar_review } = req.body
            const datas = await ReviewPengguna.find({ id_konsumen: id_konsumen })
            const indexReview = datas.length

            const konsumenDetail = await Konsumen.findOne({ _id: id_konsumen })
            const nilaiReview = nilai_review + konsumenDetail.nilai_review
            let numberReview
            if (indexReview > 0) {
                numberReview = nilaiReview / indexReview
            } else {
                numberReview = nilaiReview / 1
            }

            // const konsumen = await Konsumen.findByIdAndUpdate({ _id: id_konsumen }, { nilai_review: numberReview })

            res.status(201).json({
                message: "create data success",
                numberReview
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