const mongoose = require("mongoose")

const ModelJenisKendaraan = new mongoose.Schema({
    jenis: {
        type: String,
        required: [true, "jenis kendaraan harus di isi"]
    },
    description: {
        type: String,
        required: [true, "dsecription kendaraan harus di isi"]
    },
    ukuran: {
        type: String,
        required: [true, "ukuran kendaraan harus di isi"]
    },
    icon_aktif: {
        type: String,
        required: [true, "icon aktif kendaraan harus di isi"]
    },
    icon_disable: {
        type: String,
        required: [true, "icon disable kendaraan harus di isi"]
    },
    icon_distributor: {
        type: String,
        required: [true, "icon distributor kendaraan harus di isi"]
    },
    umurKendaraan: {
        type: Number,
        required: [true, "umurKendaraan kendaraan harus di isi"]
    }
})

const JenisKendaraan = mongoose.model("JenisKendaraan", ModelJenisKendaraan)

module.exports = JenisKendaraan