const mongoose = require('mongoose')

const modelDistributtor = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId harus di isi']
    },
    nama_distributor: {
        type: String,
        required: [true, 'name distributtor harus di isi']
    },
    alamat_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Address',
        required: [true, 'alamat_id harus di isi']
    },
    npwp: {
        type: Number,
        require: [true, 'NPWP harus di isi']
    },
    file_npwp: {
        type: String,
        require: [true, 'file  harus di isi']
    },
    individu: {
        nik: {
            type: Number,
            required: false
        },
        file_ktp: {
            type: String,
            required: false
        }
    },
    perusahaan: {
        nomorAkta: {
            type: Number,
            required: false
        },
        noTelepon: {
            type: Number,
            required: false
        },
        alamatGudang: {
            type: mongoose.Types.ObjectId,
            ref: 'Address',
            required: false
        },
        fileNib: {
            type: String,
            require: false
        }
    }
}, { timestamp: true });

const Distributtor = mongoose.model('Distributtor', modelDistributtor);

module.exports = Distributtor;