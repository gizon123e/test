const mongoose = require('mongoose')

const modelPinaltiVendor = new mongoose.Schema({
    id_user_vendor: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "id_user_vendor harus di isi"]
    },
    alasan_pinalti: {
        type: String,
        required: [true, "id_alasan_pinalti harus di isi"]
    },
    poin_pinalti: {
        type: Number,
        required: [true, "poin_pinalti harus di isi"]
    }
}, { timestamps: true })

const PinaltiVendor = mongoose.model('PinaltiVendor', modelPinaltiVendor)

module.exports = PinaltiVendor