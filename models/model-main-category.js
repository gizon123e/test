const mongoose = require('mongoose')

const mainModelCategory = new mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String
    },
    contents: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SubCategory"
        }
    ],
    icon:{
        type: String,
        default: ""
    },
    showAt:{
        type: String,
        enum: ["mobile", "web", "mobile dan web", "all"],
        default: "all",
        required: ['true', "show at harus ada"]
    },
    for:{
        type: String,
        enum: ["konsumen", "vendor", "supplier", "produsen"]
    }
}, { timestamp: true })

const MainCategory = mongoose.model('MainCategory', mainModelCategory)

module.exports = MainCategory