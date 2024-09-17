const mongoose = require("mongoose")

const modelReviewPengguna = new mongoose.Schema({
    id_toko: {
        type: mongoose.Types.ObjectId,
        ref: "TokoSupplier",
        required: [true, "id_userReview harus di isi"]
    },
    nilai_pengemasan: {
        type: Number,
        default: 0
    },
    nilai_kualitas: {
        type: Number,
        default: 0
    },
    nilai_keberhasilan: {
        type: Number,
        default: 0
    },
    id_produk: {
        type: String,
        ref: "Product",
        required: [true, "id_produk harus di isi"]
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId harus di isi"]
    }
}, { timestamps: true })

const ReviewProdusen = mongoose.model("ReviewProdusen", modelReviewPengguna)

module.exports = ReviewProdusen