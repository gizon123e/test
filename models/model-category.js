const mongoose = require('mongoose')

const modelCategory = mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String
    }
}, { timestamp: true })

const Category = mongoose.model('Category', modelCategory)

module.exports = Category