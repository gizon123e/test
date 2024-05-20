const mongoose = require('mongoose')

const modelPengiriman = mongoose.Schema({
    orderId:{
        type: mongoose.Types.ObjectId,
        ref: "Orders"
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
    status_pengiriman:{
        type: String,
        enum: ["diproses", "dikirim", "pesanan selesai"],
        default: "diproses"
    }
})

const Pengiriman = mongoose.model("Pengiriman", modelPengiriman);
module.exports = Pengiriman