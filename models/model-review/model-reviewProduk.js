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
        required: [true, "nilai_review harus di isi"],
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId harus di isi"]
    },
    replies: [{
        type: mongoose.Types.ObjectId,
        ref: "Reply"
    }]
}, { timestamps: true })

const ReviewProduk = mongoose.model("ReviewProduk", modelReviewProduk)

module.exports = ReviewProduk