const ReviewVendor = require('../../models/vendor/model-reviewVendor')
const Konsumen = require('../../models/konsumen/model-konsumen')
const Vendor = require('../../models/vendor/model-vendor')

module.exports = {
    getAllReviewKonsumen: async (req, res, next) => {
        try {
            const datas = await ReviewVendor.find()
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
            const { id_vendor, nilai_review } = req.body
            const datas = await ReviewVendor.find({ id_vendor })
            const indexReview = datas.length + 1

            const vendorDetail = await Vendor.findOne({ _id: id_vendor })
            const nilaiReview = nilai_review + konsumenDetail.nilai_review
            let numberReview
            if (indexReview > 0) {
                const hitunganView = nilaiReview - vendorDetail.nilai_pinalti
                numberReview = hitunganView / indexReview
            } else {
                const hitunganView = nilaiReview - vendorDetail.nilai_pinalti
                numberReview = hitunganView / 1
            }

            const vendorUpdate = await Vendor.findByIdAndUpdate({ _id: id_vendor }, { nilai_review: numberReview })
            const createReview = await ReviewVendor.create({
                id_vendor,
                nilai_review,
                userId: req.user.id
            })

            res.status(201).json({
                message: "create data success",
                createReview
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