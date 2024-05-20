const mongoose = require("mongoose");
const ModelPembayaran = mongoose.Schema({
    id_pesanan: {
        type: mongoose.Types.ObjectId,
        ref:"Pesanan"
    },
    total_bayar:{
        type: Number,
    },
    isTerbayarkan:{
        type: Boolean,
        default: false
    }
});

const Pembayaran = mongoose.model("Pembayaran", ModelPembayaran);
module.exports = Pembayaran