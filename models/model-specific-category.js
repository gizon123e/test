const mongoose = require('mongoose')

const modelSpecificCategory = mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String,
        unique: true
    },
    icon: {
        type: String
    },
    show_at_web:{
        type: Boolean,
        default: false
    }
}, { timestamp: true })

const SpecificCategory = mongoose.model('SpecificCategory', modelSpecificCategory)

module.exports = SpecificCategory