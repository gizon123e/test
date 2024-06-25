const mongoose = require('mongoose')

const ModelPengemudi = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, 'ID distributor harus diisi']
    },
    nama: {
        type: String,
        required: [true, 'Nama pengemudi harus diisi']
    },
    jenisKelamin: {
        type: String,
        required: [true, 'jenis kelamin harus diisi'],
        enum: ["Laki-Laki", "Perempuan"],
        message: "{VALUE} is not supported",
    },
    tanggalLahir: {
        type: String,
        required: [true, 'tanggal lahir harus diisi']
    },
    file_sim: {
        type: String,
        required: [true, 'file Sim pengemudi harus diisi']
    },
    profile: {
        type: String,
        required: [true, 'profile pengemudi harus diisi']
    },
    fileKTP: {
        type: String,
        required: false,
        default: null
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
})

const Pengemudi = mongoose.model('Pengemudi', ModelPengemudi)

module.exports = Pengemudi