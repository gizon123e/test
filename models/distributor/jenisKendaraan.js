const mongoose = require("mongoose")

const ModelJenisKendaraan = new mongoose.Schema({
    jenis: {
        type: String,
        required: [true, "jenis kendaraan harus di isi"]
    },
    icon_aktif: {
        type: String,
        required: [true, "icon aktif kendaraan harus di isi"]
    },
    icon_disable: {
        type: String,
        required: [true, "icon kendaraan harus di isi"]
    },
})

const JenisKendaraan = mongoose.model("JenisKendaraan", ModelJenisKendaraan)

module.exports = JenisKendaraan