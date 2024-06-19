const mongoose = require('mongoose')

const ModelPengemudi = new mongoose.Schema({
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
    profile: {
        type: String,
        required: [true, 'file Sim kendaraan harus diisi']
    },
})

const Pengemudi = mongoose.model('Pengemudi', ModelPengemudi)

module.exports = Pengemudi