const mongoose = require('mongoose')

const modelReviewDistributor = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: "Distributtor",
        required: [true, "id_distributor harus di isi"]
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

const ReviewDistributor = mongoose.model("ReviewDistributor", modelReviewDistributor)

module.exports = ReviewDistributor