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
    tokoType: {
        type: String,
        enum: ["TokoVendor", "TokoProdusen", "TokoSupplier"]
    },
    id_konsumen: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_kosumen harus di isi"],
        refPath: "konsumenType"
    },
    konsumenType: {
        type: String,
        enum: ["TokoVendor", "Sekolah", "TokoSupplier"]
    },
    id_address: {
        type: mongoose.Types.ObjectId,
        required: false,
        ref: "Address"
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
        type: mongoose.Types.ObjectId,
        required: [true, "id_pesanan harus di isi"],
        ref: "ProsesPengirimanDistributor"
    },
    total_qty: {
        type: Number,
    },
    image_pengiriman: {
        type: String,
        required: false
    },
    statusPengiriman: {
        type: String,
        required: false
    },
    update_date_pesanan_selesai: {
        type: Date,
        required: false,
        default: null
    }
}, { timestamps: true })

const PelacakanDistributorKonsumen = mongoose.model('PelacakanDistributorDistributor', modulePelacakanDistributorKonsumen)

module.exports = PelacakanDistributorKonsumen