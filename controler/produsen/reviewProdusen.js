const Product = require('../../models/model-product')
const ReviewProduk = require('../../models/model-review/model-reviewProduk')
const Supplier = require('../../models/supplier/model-supplier')

module.exports = {
    getReviewUlasanProdusen: async (req, res, next) => {
        try {
            const { nilai_review, komentar_review, foto_video, replies } = req.query

            const supplier = await Supplier.findOne({ userId: req.user.id })
            if (!supplier) return res.status(404).json({ message: 'data Supplier not found' })

            const dataPayload = []
            const product = await Product.find({ userId: req.user.id })

            let rating_dari_pembeli = 0
            let index_user = 0
            for (const data of product) {
                const reviewVendor = await ReviewProduk.find({ id_produk: data._id }).populate('id_konsumen').populate('id_produk')
                    .populate({
                        path: 'replies',
                        populate: 'vendor'
                    })

                index_user += reviewVendor.length
                for (const item of reviewVendor) {
                    rating_dari_pembeli += item.nilai_review
                }
            }

            for (const data of product) {
                const query = { id_produk: data._id }

                if (nilai_review) {
                    query.nilai_review = nilai_review
                }
                const reviewVendor = await ReviewProduk.find(query).populate('id_konsumen').populate('id_produk')
                    .populate({
                        path: 'replies',
                        populate: 'vendor'
                    })

                for (const item of reviewVendor) {
                    dataPayload.push(item)
                }
            }

            let reviews = dataPayload
            if (komentar_review === 'true') {
                reviews = dataPayload.filter(review => review.komentar_review || review.komentar_review.trim() !== '');
            }

            if (foto_video === 'true') {
                reviews = dataPayload.filter(review => review.images.length > 0);
            }

            if (replies === 'true') {
                reviews = dataPayload.filter(review => review.replies.length > 0 || review.replies.length > 0);
            } else if (replies === 'false') {
                reviews = dataPayload.filter(review => review.replies.length === 0 || review.replies.length === 0);
            }

            const totalRatingPembeli = parseInt(rating_dari_pembeli) / parseInt(index_user)

            res.status(200).json({
                message: "get All review success",
                data: reviews,
                totalRatingPembeli
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