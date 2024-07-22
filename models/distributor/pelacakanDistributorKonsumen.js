const mongoose = require('mongoose')

const modulePelacakanDistributorKonsumen = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_distributor harus di isi"],
        ref: "Distributtor"
    },
    id_address: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_toko harus di isi"],
        ref: "Address"
    },
    latitude: {
        type: Number,
        required: [true, "latitude harus di isi"]
    },
    longitude: {
        type: Number,
        required: [true, "latitude harus di isi"]
    },
}, { timestamps: true })

const PelacakanDistributorKonsumen = mongoose.model('PelacakanDistributorDistributor', modulePelacakanDistributorKonsumen)

module.exports = PelacakanDistributorKonsumen