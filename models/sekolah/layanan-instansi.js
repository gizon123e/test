const mongoose = require("mongoose")

const modelLayananInstansi = new mongoose.Schema({
    nama: {
        type: String,
        required: [true, 'nama harus di isi']
    }
})

const LayananInstansi = mongoose.model("LayananInstansi", modelLayananInstansi)

module.exports = LayananInstansi