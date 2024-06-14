const mongoose = require("mongoose")

const ModelJenisKendaraan = new mongoose.Schema({
    jenis: {
        type: String,
        required: [true, "jenis kendaraan harus di isi"]
    }
})

const JenisKendaraan = mongoose.model("JenisKendaraan", ModelJenisKendaraan)

module.exports = JenisKendaraan