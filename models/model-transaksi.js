const mongoose = require("mongoose");

const modelTransaksi = mongoose.Schema({
    id_pembayaran: {
        type: mongoose.Types.ObjectId,
        ref: "Pembayaran"
    },
    jenis_transaksi:{
        type: String,
        enum: ["masuk", "keluar"]
    },
    status:{
        type: String,
        enum: ["Menunggu Pembayaran", "Pembayaran Gagal", "Pembayaran Dibatalkan", "Pembayaran Berhasil"]
    }
});

const Transaksi = mongoose.model("Transaksi", modelTransaksi);
module.exports = Transaksi