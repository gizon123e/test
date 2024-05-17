const mongoose = require('mongoose')
const { Decimal128 } = require('mongodb')

const modelAddress = mongoose.Schema({
    label_alamat:{
        type: String
    },
    province: {
        required: [true, 'Province harus di isi'],
        type: String
    },
    regency: {
        required: [true, 'Regency harus di isi'],
        type: String
    },
    district: {
        required: [true, 'district harus di isi'],
        type: String
    },
    village: {
        required: [true, 'Village harus di isi'],
        type: String
    },
    code_pos: {
        required: [true, 'Code Pos harus di isi'],
        type: Number
    },
    address_description: {
        type: String,
        required: [true, 'Address Description harus di isi'],
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    isPic:{
        type: Boolean,
        default: false
    },
    isMain: {
        type: Boolean,
        default: false
    },
    pinAlamat: {
        long:{
            type: Decimal128
        },
        lat:{
            type: Decimal128
        }
    },
}, { timestamp: true })

const Address = mongoose.model('Address', modelAddress)

module.exports = Address