const mongoose = require('mongoose')

const modelPengiriman = mongoose.Schema({
    orderId:{
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    distributorId:{
        type: mongoose.Types.ObjectId,
        ref: "Distributtor"
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
        ref: "KendaraanDistributor"
    },
    productToDelivers:[{
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
    }
})

const Pengiriman = mongoose.model("Pengiriman", modelPengiriman);
module.exports = Pengiriman