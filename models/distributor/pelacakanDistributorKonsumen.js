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
    id_kosumen: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_kosumen harus di isi"],
        ref: "Konsumen"
    },
    latitude: {
        type: Number,
        required: false,
        default: null
    },
    longitude: {
        type: Number,
        required: false,
        default: null
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
    },
    pesana_diserahkan_distributor: {
        type: String,
        default: null
    },
    pesanan_dalam_penjemputan: {
        type: String,
        default: null
    },
    pesanan_diserahkan_konsumen: {
        type: String,
        default: null
    }

}, { timestamps: true })

const PelacakanDistributorKonsumen = mongoose.model('PelacakanDistributorDistributor', modulePelacakanDistributorKonsumen)

module.exports = PelacakanDistributorKonsumen