const mongoose = require('mongoose')

const modelPinaltiDistributor = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: "Distributtor",
        required: [true, "id_distributor harus di isi"]
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

const PinaltiDistributor = mongoose.model('PinaltiDistributor', modelPinaltiDistributor)

module.exports = PinaltiDistributor