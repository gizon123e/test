const mongoose = require('mongoose')

const modulePelacakanDistributorKonsumen = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_distributor harus di isi"],
        ref: "Distributtor"
    },
    id_toko: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_distributor harus di isi"],
        ref: "TokoVendor"
    },
    id_address: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_toko harus di isi"],
        ref: "Address"
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    },
    id_pesanan: {
        type: String,
        required: [true, "id_pesanan harus di isi"],
        ref: "Pengiriman"
    },
    ketersediaan: {
        type: Boolean,
        default: [true, "ketersediaan harus di isi"]
    },
    total_qty: {
        type: Number,
        required: [true, "total_qty harus di isi"]
    },
    image_pengiriman: {
        type: String,
        required: false
    }
}, { timestamps: true })

const PelacakanDistributorKonsumen = mongoose.model('PelacakanDistributorDistributor', modulePelacakanDistributorKonsumen)

module.exports = PelacakanDistributorKonsumen