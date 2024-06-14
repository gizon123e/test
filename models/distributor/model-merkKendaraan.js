const mongoose = require("mongoose")

const modelMerkKendaraan = mongoose.Schema({
    merk: {
        type: String,
        required: [true, 'merk harus di isi']
    }
})

const MerkKendaraan = mongoose.model("MerkKendaraan", modelMerkKendaraan)

module.exports = MerkKendaraan