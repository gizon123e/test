const mongoose = require('mongoose');

const kendaraanDistributorSchema = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, 'ID distributor harus diisi']
    },
    fotoKendaraan: {
        type: String,
        required: [true, 'fotoKendaraan harus diisi']
    },
    STNK: {
        type: String,
        required: [true, 'STNK harus diisi']
    },
    jenisKendaraan: {
        type: mongoose.Types.ObjectId,
        ref: "JenisKendaraan",
        required: [true, "jenis Kendaraan harus di isi"]
    },
    merekKendaraan: {
        type: mongoose.Types.ObjectId,
        ref: "MerkKendaraan",
        required: [true, 'merek Kendaraan harus diisi']
    },
    typeKendaraan: {
        type: String,
        required: [true, 'type Kendaraan harus diisi']
    },
    warna: {
        type: String,
        required: [true, 'Warna kendaraan harus diisi']
    },
    nomorPolisi: {
        type: Number,
        required: [true, 'Warna kendaraan harus diisi']
    },
    tarifId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'tarifId harus di isi'],
        ref: "Tarif"
    },
    iconKendaraan: {
        type: String,
        required: false
    },
    is_Active: {
        type: Boolean,
        required: [true, 'is_Active pengemudi harus diisi'],
        default: false
    },
    descriptionTolak: {
        type: String,
        required: false,
        default: null
    },

}, { timestamps: true });

const KendaraanDistributor = mongoose.model('KendaraanDistributor', kendaraanDistributorSchema);

module.exports = KendaraanDistributor;
