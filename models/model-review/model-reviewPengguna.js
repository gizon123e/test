const mongoose = require("mongoose")

const modelReviewPengguna = new mongoose.Schema({
    id_userReview: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "id_userReview harus di isi"]
    },
    nilai_review: {
        type: Number,
        required: [true, "nilai_review harus di isi"]
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId harus di isi"]
    }
}, { timestamps: true })

const ReviewPengguna = mongoose.model("ReviewPengguna", modelReviewPengguna)

module.exports = ReviewPengguna