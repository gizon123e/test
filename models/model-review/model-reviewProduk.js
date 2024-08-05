const mongoose = require('mongoose')

const modelReviewProduk = new mongoose.Schema({
    id_produk: {
        type: String,
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
    },
    images: [{
        type: String,
        required: false,
    }],
    video: [{
        type: String,
        required: false,
    }],
    nilai_keseluruan: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId harus di isi"]
    },
    replies: [{
        type: mongoose.Types.ObjectId,
        ref: "Reply"
    }],
    id_konsumen: {
        type: mongoose.Types.ObjectId,
        ref: "Konsumen",
        required: [true, "id_konsumen harus di isi"]
    }
}, { timestamps: true })

const ReviewProduk = mongoose.model("ReviewProduk", modelReviewProduk)

module.exports = ReviewProduk