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
    status: {
        type: String,
        enum: ["Ditinjau", "Aktif", "Ditolak", "Diblokir", "Disuspend", "Diberhentikan"],
        message: "{VALUE} is not supported",
        default: "Ditinjau"
    },
    descriptionTolak: {
        type: String,
        required: false,
        default: null
    },
    no_telepon: {
        type: String,
        required: [true, 'no_telepon pengemudi harus diisi'],
    },
    jenis_sim: {
        type: String,
        required: [true, 'jenis_sim pengemudi harus diisi'],
    }
})

const Pengemudi = mongoose.model('Pengemudi', ModelPengemudi)

module.exports = Pengemudi