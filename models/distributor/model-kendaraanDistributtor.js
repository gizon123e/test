const mongoose = require('mongoose');

const kendaraanDistributorSchema = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, 'ID distributor harus diisi']
    },

    merk: {
        type: String,
        required: [true, 'Merk kendaraan harus diisi']
    },
    tipe: {
        type: String,
        required: [true, 'Tipe kendaraan harus diisi']
    },
    tnkb: {
        type: String,
        required: [true, 'TNKB kendaraan harus diisi']
    },
    no_mesin: {
        type: String,
        required: [true, 'Nomor mesin kendaraan harus diisi']
    },
    no_rangka: {
        type: String,
        required: [true, 'Nomor rangka kendaraan harus diisi']
    },
    tahun: {
        type: Number,
        required: [true, 'Tahun kendaraan harus diisi']
    },
    warna: {
        type: String,
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
    }
}, { timestamps: true });

const KendaraanDistributor = mongoose.model('KendaraanDistributor', kendaraanDistributorSchema);

module.exports = KendaraanDistributor;
