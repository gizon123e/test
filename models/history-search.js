const mongoose = require('mongoose')

const modelHistorySearch = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, "userId harus di isi"],
        ref: "User",
        required: [true, 'search harus di isi']
    },
    search: {
        type: String,
        required: [true, 'userId harus di isi']
    }
}, { timestamps: true })

const HistorySearch = mongoose.model('HistorySearch', modelHistorySearch)
module.exports = HistorySearch