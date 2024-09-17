const mongoose = require('mongoose')

const moduleRekening = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, "id_distributor harus di isi"]
    },
    bank: {
        type: String,
        required: [true, "bank harus di isi"]
    },
    no_rekening: {
        type: Number,
        required: [true, "no_rekening harus di isi"]
    },
    nama_lengkap: {
        type: String,
        required: [true, "nama_lengkap harus di isi"]
    },
    rekening_utama: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const RekeningDistributor = mongoose.model('RekeningDistributor', moduleRekening)

module.exports = RekeningDistributor