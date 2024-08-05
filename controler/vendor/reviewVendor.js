const Product = require('../../models/model-product')
const ReviewProduk = require('../../models/model-review/model-reviewProduk')
const Vendor = require('../../models/vendor/model-vendor')

module.exports = {
    getReviewUlasanVendor: async (req, res, next) => {
        try {
            const { nilai_review, komentar_review, foto_video, replies } = req.query

            const vendor = await Vendor.findOne({ userId: req.user.id })
            if (!vendor) return res.status(404).json({ message: 'data Vendor not found' })

            const dataPayload = []
            const product = await Product.find({ userId: req.user.id })

            for (const data of product) {
                const query = { id_produk: data._id }

                if (nilai_review) {
                    query.nilai_review = nilai_review
                }
                const reviewVendor = await ReviewProduk.find(query).populate('id_konsumen').populate('id_produk')
                for (const item of reviewVendor) {
                    dataPayload.push(item)
                }
            }
            dataPayload.length
            let reviews = dataPayload
            if (komentar_review === 'true') {
                reviews = dataPayload.filter(review => review.komentar_review || review.komentar_review.trim() !== '');
            }

            if (foto_video === 'true') {
                reviews = dataPayload.filter(review => review.images.length > 0 || review.video.length > 0);
            }

            if (replies === 'true') {
                reviews = dataPayload.filter(review => review.replies.length > 0 || review.replies.length > 0);
            } else if (replies === 'false') {
                reviews = dataPayload.filter(review => review.replies.length === 0 || review.replies.length === 0);
            }

            res.status(200).json({
                message: "get All review success",
                data: reviews
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

            next(error);
        }
    }
}