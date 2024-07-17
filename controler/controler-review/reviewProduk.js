const ReviewProduk = require('../../models/model-review/model-reviewProduk')
const Product = require('../../models/model-product')

module.exports = {
    tambahUlasan: async (req, res, next) => {
        try {
            const { id_produk } = req.params;
            const { komentar_review, nilai_review } = req.body;
            const reviews = await ReviewProduk.find({ id_produk })
            const indexReviews = reviews.length + 1
            // Membuat ulasan baru
            const review = new ReviewProduk({
                id_produk,
                userId: req.user.id,
                komentar_review,
                nilai_review
            });

            // Menyimpan ulasan ke database
            const savedReview = await review.save();

            // Menambahkan ulasan ke produk terkait
            const product = await Product.findOne({ _id: id_produk });
            const hitungReview = product.poin_review + nilai_review

            if (indexReviews > 0) {
                const totalReview = hitungReview / indexReviews
                console.log(product.poin_review)
                await Product.findByIdAndUpdate({ _id: id_produk }, {
                    $push: { reviews: savedReview._id },
                    poin_review: totalReview
                }, { new: true, useFindAndModify: false })
            } else {
                const totalReview = hitungReview / 1
                console.log(product.poin_review)
                await Product.findByIdAndUpdate({ _id: id_produk }, {
                    $push: { reviews: savedReview._id },
                    poin_review: totalReview
                }, { new: true, useFindAndModify: false })
            }

            res.status(200).json({
                message: "",
                data: savedReview
            });
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

    getUlasanByProductId: async (req, res, next) => {
        const { id_produk } = req.params;

        try {
            const reviews = await ReviewProduk.find({ id_produk }).populate('replies').populate("id_produk");
            res.status(200).json({
                message: "get all review",
                data: reviews
            });
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