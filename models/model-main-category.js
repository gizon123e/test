const mongoose = require('mongoose')

const mainModelCategory = mongoose.Schema({
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
        enum: ["mobile", "web", "mobile dan web"],
        required: ['true', "show at harus adas"]
    }
}, { timestamp: true })

const MainCategory = mongoose.model('MainCategory', mainModelCategory)

module.exports = MainCategory