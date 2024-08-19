const mongoose = require('mongoose')

const modelPinaltiProdusen = new mongoose.Schema({
    id_user_supplier: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "id_user_supplier harus di isi"]
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

const PinaltiProdusen = mongoose.model('PinaltiProdusen', modelPinaltiProdusen)

module.exports = PinaltiProdusen