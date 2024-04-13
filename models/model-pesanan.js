const mongoose = require('mongoose')
require('./model-auth-user')
require('./model-product')
const pesananModels = new mongoose.Schema({
    pelanggan_id : {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    sellerID:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    produk: [
        {
            _id: false,
            produkID: {
                type: mongoose.Types.ObjectId,
                require: true,
                ref: "Product"
            },
            jumlah:{
                type: Number,
                required: true
            }
        }
    ],
    status:{
        type: String,
        required:true,
        enum: ["Belum Bayar", "Sedang diproses", "Dikirim", "Selesai", "Dibatalkan"]
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
})
const Pesanan = mongoose.model('Pesanan', pesananModels)
module.exports = Pesanan