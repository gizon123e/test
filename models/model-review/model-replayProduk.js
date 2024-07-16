const mongoose = require('mongoose');

const modelReply = new mongoose.Schema({
    id_review: {
        type: mongoose.Types.ObjectId,
        ref: "ReviewProduk",
        required: [true, "id_review harus di isi"]
    },
    komentar_reply: {
        type: String,
        required: [true, "komentar_reply harus di isi"]
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId harus di isi"]
    }
}, { timestamps: true });

const Reply = mongoose.model("Reply", modelReply);

module.exports = Reply;
