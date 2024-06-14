const mongoose = require('mongoose')

const modelPesananDistributor = new mongoose.Schema({
    id_kendaraanDistributor: {
        type: mongoose.Types.ObjectId,
        ref: 'KendaraanDistributor',
        required: [true, 'ID Kendaraan Distributor harus diisi']
    },
    id_pesanan: {
        type: mongoose.Types.ObjectId,
        ref: "Pesanan",
        required: [true, "ID Pesanan harus di isi"]
    },
    alamatKonsument: {
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "Alamat Konsument harus di isi"]
    },
    alamatTokoVendor: {
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "Alamat Toko Vendor harus di isi"]
    },
    konsumen: {
        type: mongoose.Types.ObjectId,
        ref: "Konsumen",
        required: [true, "Alamat Toko Vendor harus di isi"]
    },
    vendor: {
        type: mongoose.Types.ObjectId,
        ref: "Vendor",
        required: [true, "Alamat Toko Vendor harus di isi"]
    },
    jasaOngkir: {
        type: Number,
        required: [true, "Jasa Ongkir harus di isi"]
    }
})

const PesananDistributor = mongoose.model("PesananDistributor", modelPesananDistributor)

module.exports = PesananDistributor