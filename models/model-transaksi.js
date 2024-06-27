const mongoose = require("mongoose");

const modelTransaksi = new mongoose.Schema({
    id_pesanan: {
        type: mongoose.Types.ObjectId,
        ref: "Pesanan",
        required: true
    },
    jenis_transaksi:{
        type: String,
        enum: ["masuk", "keluar"],
        required: true
    },
    status:{
        type: String,
        enum: ["Menunggu Pembayaran", "Pembayaran Gagal", "Pembayaran Dibatalkan", "Pembayaran Berhasil"],
        required: true
    },
    kode_transaksi:{
        type: String,
        required: true
    }
}, {timestamps: true});

const Transaksi = mongoose.model("Transaksi", modelTransaksi);
module.exports = Transaksi