const mongoose = require('mongoose')

const modulePelacakanDistributorToko = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_distributor harus di isi"],
        ref: "Distributtor"
    },
    id_toko: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_toko harus di isi"],
        ref: "TokoVendor"
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

const PelacakanDistributorToko = mongoose.model("PelacakanDistributor", modulePelacakanDistributorToko)

module.exports = PelacakanDistributorToko