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
    no_telp: {
        type: String,
        require: [true, 'no_telepon harus di isi']
    },
    is_kendaraan: {
        type: String,
        enum: ['Motor', 'Mobil', 'Mobil dan Motor'],
        message: '{VALUE} is not supported',
        required: [true, 'is_kendaraan harus di isi']
    },
    is_active: {
        type: Boolean,
        required: [true, "is active harus di isi"]
    },
    imageDistributtor: {
        type: String,
        required: [true, 'imageDistributor harus di isi'],
    },
    jenisUsaha: {
        type: String,
        required: [true, 'jenis Usaha harus di isi'],
        enum: ["Company", "Individu"]
    }
}, { timestamp: true });

const Distributtor = mongoose.model('Distributtor', modelDistributtor);

module.exports = Distributtor;