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
    },
    detailBiaya:{
        totalHargaProduk: {
            type: Number
        },
        totalOngkir: {
            type: Number
        },
        totalPotonganOngkir: {
            type: Number
        },
        jumlahOngkir:{
            type: Number
        },
        biaya_layanan: {
            type: Number
        },
        biaya_jasa_aplikasi: {
            type: Number
        }
    },
    subsidi: {
        type: Boolean
    },
    jumlah: {
        type: Number
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

const modelTransaksi2 = new mongoose.Schema({
    jumlah: {
        type: Number
    },
    jenis_transaksi:{
        type: String,
    },
    status:{
        type: String,
        enum: ["Menunggu Pembayaran", "Pembayaran Gagal", "Pembayaran Dibatalkan", "Pembayaran Berhasil"],
        required: true
    },
    kode_transaksi:{
        type: String,
        required: true
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    subsidi: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const Transaksi = mongoose.model("Transaksi", modelTransaksi);
const Transaksi2 = mongoose.model("Transaksi2", modelTransaksi2);

module.exports = {Transaksi, Transaksi2}