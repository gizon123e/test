const mongoose = require('mongoose')

const modelDistributtor = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId harus di isi']
    },
    name_kantor: {
        type: String,
        required: false
    },
    no_telepon: {
        type: String,
        require: [true, 'no_telepon harus di isi']
    },
    armada_pengiriman: {
        type: String,
        enum: ['Speda Motor', 'Mobil', 'Truck', 'Mobil Box'],
        message: '{VALUE} is not supported',
        required: [true, 'armada_pengiriman harus di isi']
    },
    name_penanggung_jawab: {
        type: String,
        required: [true, 'name_penanggung_jawab harus di isi']
    },
    nik_ktp: {
        type: Number,
        required: [true, 'nik_ktp harus di isi']
    },
    image_ktp: {
        type: String,
        required: [true, 'image_ktp harus di isi']
    },
    image_sim: {
        type: String,
        required: [true, 'image sim harus di isi']
    },
    addressId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'addressId harus di isi'],
        ref: 'Address'
    },
    jam_oprasi: {
        type: String,
        required: [true, 'jam_oprasi harus di isi']
    },
    harga_ongkir: {
        type: Number,
        required: [true, 'harga ongkir harus di isi']
    }
}, { timestamp: true })

const Distributtor = mongoose.model('Distributtor', modelDistributtor)

module.exports = Distributtor