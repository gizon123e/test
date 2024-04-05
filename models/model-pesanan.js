const mongoose = require('mongoose')
require('./model-auth-user')
require('./model-product')
const pesananModels = new mongoose.Schema({
    pelanggan_id : {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    produk: [
        {
            type:mongoose.Types.ObjectId,
            ref: "Product"
        }
    ],
    status:{
        type: String,
        enum: ["Belum Bayar", "Sedang diproses", "Dikirim", "Selesai", "Dibatalkan"]
    }

})