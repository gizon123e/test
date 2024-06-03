const mongoose = require("mongoose");

const modelTransaksi = mongoose.Schema({
    id_pesanan: {
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    jenis_transaksi:{
        type: String,
        enum: ["masuk", "keluar"]
    },
    status:{
        type: String,
        enum: ["Menunggu Pembayaran", "Pembayaran Gagal", "Pembayaran Dibatalkan", "Pembayaran Berhasil", "Kurang Bayar", "Lebih Bayar"]
    }
});

const Transaksi = mongoose.model("Transaksi", modelTransaksi);
module.exports = Transaksi