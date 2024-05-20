const mongoose = require("mongoose");
const modelTagihan = mongoose.Schema({
    id_pesanan: {
        type: mongoose.Types.ObjectId,
        ref:"Pesanan"
    },
    sisa_pembayaran:{
        type: Number,
    },
});

const Tagihan = mongoose.model("Tagihan", modelTagihan);
module.exports = Tagihan