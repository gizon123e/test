const mongoose = require('mongoose')

const modelReviewProduk = new mongoose.Schema({
    id_produk: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: [true, "id_produk harus di isi"]
    },
    komentar_review: {
        type: String,
        required: false,
        default: null
    },
    nilai_review: {
        type: Number,
        required: false,
        default: null
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId harus di isi"]
    }
}, { timestamps: true })

const ReviewProduk = mongoose.model("ReviewProduk", modelReviewProduk)

module.exports = ReviewProduk