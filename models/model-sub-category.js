const mongoose = require('mongoose')

const subModelCategory = mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String
    },
    contents: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SpecificCategory"
        }
    ],
}, { timestamp: true })

const SubCategory = mongoose.model('SubCategory', subModelCategory)

module.exports = SubCategory