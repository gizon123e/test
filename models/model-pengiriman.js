const mongoose = require('mongoose')

const modelPengiriman = new mongoose.Schema({
    orderId:{
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    distributorId:{
        type: mongoose.Types.ObjectId,
        ref: "User "
    },
    waktu_pengiriman:{
        type: String
    },
    jenis_pengiriman:{
        type: String,
        enum: ["express", "hemat"]
    },
    total_ongkir: {
        type: Number
    },
    ongkir: {
        type: Number
    },
    potongan_ongkir: {
        type: Number
    },
    kendaraanId:{
        type: mongoose.Types.ObjectId,
        ref: "JenisKendaraan"
    },
    productToDelivers:[{
        _id: false,
        productId: {
            type: String,
            ref: "Product"
        },
        quantity: {
            type: Number
        }
    }],
    status_pengiriman:{
        type: String,
        enum: ["diproses", "dikirim", "pesanan selesai"],
        default: "diproses"
    },
    kode_pengiriman:{
        type: String
    },
}, {timestamps: true})

const Pengiriman = mongoose.model("Pengiriman", modelPengiriman);
module.exports = Pengiriman