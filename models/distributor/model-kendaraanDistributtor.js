const mongoose = require('mongoose');

const kendaraanDistributorSchema = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, 'ID distributor harus diisi']
    },

    nama: {
        type: String,
        required: [true, 'Merk kendaraan harus diisi']
    },
    jenisKelamin: {
        type: String,
        required: [true, 'jenis kelamin harus diisi'],
        enum: ["laki-laki", "perempuan"],
        message: "{VALUE} is not supported",
    },
    tanggalLahir: {
        type: String,
        required: [true, 'tanggal lahir harus diisi']
    },
    file_sim: {
        type: String,
        required: [true, 'file Sim kendaraan harus diisi']
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
    }
}, { timestamps: true });

const KendaraanDistributor = mongoose.model('KendaraanDistributor', kendaraanDistributorSchema);

module.exports = KendaraanDistributor;
