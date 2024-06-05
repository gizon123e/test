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
    }
}, { timestamp: true })

const DokumenDistributor = mongoose.model('OrderDistributtor', modelDokumenDistributor)

module.exports = DokumenDistributor