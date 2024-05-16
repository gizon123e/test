const mongoose = require('mongoose')

const modelDokumenDistributor = mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, " id_distributor harus di isi"],
    },
    no_akta: {
        type: Number,
        required: [true, "no_akta harus di isi"]
    },
    nib: {
        type: String,
        required: [true, "nib harus di isi"]
    },
    npwp: {
        type: String,
        required: [true, 'npwp harus di isi']
    },
    profile_pict: {
        type: String,
        default: "http://localhost:4000/public/profile_picts/default.jpg"
    }
}, { timestamp: true })

const DokumenDistributor = mongoose.model('OrderDistributtor', modelDokumenDistributor)

module.exports = DokumenDistributor