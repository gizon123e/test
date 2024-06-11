const mongoose = require('mongoose')
const SpecificCategory = require('./model-specific-category')

const subModelCategory = new mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String,
        index: true
    },
    contents: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SpecificCategory"
        }
    ],
}, { timestamp: true });

const SubCategory = mongoose.model('SubCategory', subModelCategory)


module.exports = SubCategory