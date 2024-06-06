const mongoose = require("mongoose");

const vendorModel = new mongoose.Schema({
    nama: {
        type: String,
        required: false,
        default: null
    },
    nik: {
        type: String,
        default: null
    },
    file_ktp: {
        type: String,
        default: null
    },
    namaBadanUsaha: {
        type: String,
        required: false,
        default: null
    },
    nomorAktaPerusahaan: {
        type: String,
        default: null
    },
    npwpFile: {
        type: String,
        default: null
    },
    nomorNpwpPerusahaan: {
        type: String,
        default: null
    },
    penanggungJawab: {
        type: mongoose.Types.ObjectId,
        required: false,
        ref: "ModelPenanggungJawabVendor"
    },
    nomorNpwp: {
        type: String,
        default: null
    },
    address: {
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "Harus memiliki alamat"]
    },
    noTeleponKantor: {
        type: String,
        required: false,
        default: null
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    jenis_kelamin: {
        type: String,
        validate: {
            validator: function (value) {
                if (this.namaBadanUsaha && value) {
                    return false;
                }
                return true;
            },
            message: "Jenis Kelamin hanya untuk user individu"
        },
        enum: ["laki", "perempuan"],
        default: null
    },
    jenis_perusahaan: {
        type: String,
        validate: {
            validator: function (value) {
                if (!this.namaBadanUsaha && value) {
                    return false;
                }
                return true;
            },
            message: "Jenis Perusahaan hanya untuk user perusahaan"
        },
        enum: ["PT", "CV", "UD", "Koperasi", "Perusahaan Perseorangan", "Firma", "Persero", "PD", "Perum", "Perjan", "Yayasan"],
        default: null
    },
    legalitasBadanUsaha: {
        type: String,
        required: false,
        default: null
    },
    profile_pict: {
        type: String,
        default: "https://staging-backend.superdigitalapps.my.id/public/profile_picts/default.jpg",
        default: null
    }
})

const Vendor = mongoose.model("Vendor", vendorModel)

module.exports = Vendor