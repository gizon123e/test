const mongoose = require("mongoose");

const modelPembatalan = new mongoose.Schema({
    pesananId:{
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    canceledBy:{
        type: String,
        enum: ["sistem", "pengguna"],
        message: '{VALUE} is not valid'
    },
    reason:{
        type: String,
        enum: [
            "berubah pikiran", 
            "ingin mengubah alamat tujuan",
            "ingin mengubah pesanan",
            "menemukan produk yang lebih murah",
            "order expired",
            "lainnya"
        ],
        message: '{VALUE} is not valid',
        default: null
    }
}, { timestamps: true });

const Pembatalan = mongoose.model("Pembatalan", modelPembatalan);

module.exports = Pembatalan