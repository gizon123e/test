const mongoose = require("mongoose");

const konsumenModel = new mongoose.Schema({
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
        enum: ["PT", "BUMDes" ,"Yayasan", "Sekolah Negeri"],
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
    },
    tanggal_lahir: {
        type: String
    }
});

konsumenModel.pre('save', function (next) {
    if (this.namaBadanUsaha && this.jenis_kelamin) {
        return next(new Error("Jenis Kelamin hanya untuk user individu"));
    }
    next();
});

konsumenModel.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    
    const docToUpdate = await this.model.findOne(this.getQuery()).lean();
    
    Object.keys(update).forEach(item => {
        if(item === 'profile_pict'){
            return;
        };

        if(Object.keys(docToUpdate).includes(item) && update[item] && docToUpdate[item]) return next(`${item} tidak bisa diubah lagi, karena sudah punya`)
    });

    if (update && docToUpdate.namaBadanUsaha && update.jenis_kelamin) {
        return next("Jenis Kelamin hanya untuk user individu");
    } else if (update && !docToUpdate.namaBadanUsaha && update.jenis_perusahaan) {
        return next("Jenis Perusahaan hanya untuk user Perusahaan");
    }
    next();
});

const Konsumen = mongoose.model("Konsumen", konsumenModel);

module.exports = Konsumen;