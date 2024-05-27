const mongoose = require("mongoose");

const konsumenModel = new mongoose.Schema({
    nama: {
        type: String,
        required: false
    },
    nik: {
        type: String
    },
    file_ktp:{
        type: String,
    },
    namaBadanUsaha: {
        type: String,
        required: false
    },
    nomorAktaPerusahaan:{
        type: String,
    },
    npwpFile:{
        type: String,
    },
    nomorNpwpPerusahaan:{
        type: String,
    },
    nomorNpwp: {
        type: String,
    },
    penanggungJawab:{
        type: mongoose.Types.ObjectId,
        ref: "ModelPenanggungJawabKonsumen"
    },
    address:{
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "Harus memiliki alamat"]
    },
    noTeleponKantor:{
        type: String,
        required: false
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    jenis_kelamin:{
        type: String,
        validate: {
            validator: function(value) {
                if (this.namaBadanUsaha && value) {
                    return false;
                }
                return true;
            },
            message: "Jenis Kelamin hanya untuk user individu"
        },
        enum: ["laki", "perempuan"]
    },
    jenis_perusahaan:{
        type: String,
        validate: {
            validator: function(value) {
                if (!this.namaBadanUsaha && value) {
                    return false;
                }
                return true;
            },
            message: "Jenis Perusahaan hanya untuk user perusahaan"
        },
        enum: ["PT", "CV"]
    },
    tanggal_lahir:{
        type: String,
    },
    legalitasBadanUsaha:{
        type: String, 
        required: false
    },
    profile_pict:{
        type: String,
        default: "https://staging-backend.superdigitalapps.my.id/public/profile_picts/default.jpg"
    }
});

konsumenModel.pre('save', function(next) {
    if (this.namaBadanUsaha && this.jenis_kelamin) {
        return next(new Error("Jenis Kelamin hanya untuk user individu"));
    }
    next();
});

konsumenModel.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (update && docToUpdate.namaBadanUsaha && update.jenis_kelamin) {
        return next("Jenis Kelamin hanya untuk user individu");
    }else if (update && !docToUpdate.namaBadanUsaha && update.jenis_perusahaan ){
        return next("Jenis Perusahaan hanya untuk user Perusahaan");
    }
    next();
});

const Konsumen = mongoose.model("Konsumen", konsumenModel);

module.exports = Konsumen;