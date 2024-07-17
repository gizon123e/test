const mongoose = require("mongoose")

const modelReviewPengguna = new mongoose.Schema({
    id_toko: {
        type: mongoose.Types.ObjectId,
        ref: "TokoVendor",
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
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId harus di isi"]
    }
}, { timestamps: true })

const ReviewVendor = mongoose.model("ReviewVendor", modelReviewPengguna)

module.exports = ReviewVendor