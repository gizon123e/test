const mongoose = require('mongoose')

const modelAddress = mongoose.Schema({
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
        typ: Boolean
    }
}, { timestamp: true })

const Address = mongoose.model('Address', modelAddress)

module.exports = Address