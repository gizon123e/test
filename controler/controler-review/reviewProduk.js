const ReviewProduk = require('../../models/model-review/model-reviewProduk')
const Product = require('../../models/model-product')

module.exports = {
    tambahUlasan: async (req, res, next) => {
        const { id_produk } = req.params;
        const { userId, komentar_review, nilai_review } = req.body;

        try {
            // Membuat ulasan baru
            const review = new ReviewProduk({
                id_produk,
                userId,
                komentar_review,
                nilai_review
            });

            // Menyimpan ulasan ke database
            const savedReview = await review.save();

            // Menambahkan ulasan ke produk terkait
            const product = await Product.findById(id_produk);
            product.reviews.push(savedReview._id);
            await product.save();

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
            const reviews = await ReviewProduk.find({ id_produk }).populate('replies');
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