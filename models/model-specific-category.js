const mongoose = require('mongoose')

const modelSpecificCategory = mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String
    },
    icon: {
        type: String
    }
}, { timestamp: true })

const SpecificCategory = mongoose.model('SpecificCategory', modelSpecificCategory)

module.exports = SpecificCategory