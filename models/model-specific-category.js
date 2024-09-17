const mongoose = require('mongoose')

const modelSpecificCategory = new mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String
    },
    show_at_web:{
        type: Boolean,
        default: () => false
    },
    icon:{
        type: String,
        default: () => "https://staging-backend.superdigitalapps.my.id/public/icon/kursi.jpg"
    }
}, { timestamp: true })

const SpecificCategory = mongoose.model('SpecificCategory', modelSpecificCategory)

module.exports = SpecificCategory