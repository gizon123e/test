const mongoose = require('mongoose')

const modelPenanggungVendor = mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    jabatan:{
        type: String,
        required: true
    },
    ktp_file: {
        type: String,
        required: true
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: true
    },
    detailId:{
        type: mongoose.Types.ObjectId,
        ref:"Vendor",
        required: true
    },
    alamat: {
        type: mongoose.Types.ObjectId,
        ref: "Address"
    },
    file_npwp:{
        type: String,
        required: true
    },
    nomorNpwp:{
        type: String,
        required: true
    },
    nik:{
        type: String,
        required: true
    }
})

const ModelPenanggungJawabVendor = mongoose.model("ModelPenanggungJawabVendor", modelPenanggungVendor);

module.exports = ModelPenanggungJawabVendor