const mongoose = require('mongoose');

const modelSekolah = new mongoose.Schema({
    namaSekolah: {
        type: String
    },
    NPSN:{
        type: Number,
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    detailId: {
        type: mongoose.Types.ObjectId,
        ref: "Konsumen"
    },
    jumlahMurid: {
        type: Number
    },
    kelas: [
        {   
            _id: false,
            namaKelas: {
                type: String
            },
            jumlahMuridKelas:{
                type: Number
            }
        }
    ],
    dataMurids:[
        {
            _id: false,
            nama: {
                type: String
            },
            gender: {
                type: String,
                enum: ["perempuan", "laki-laki"]
            },
            nik:{
                type: String
            },
            nisn: {
                type: String
            },
            pict:{
                type: String
            }
        }
    ],
    jenisPendidikan:{
        type: String,
        enum: [ "formal", "non-formal" ],
        message: "{VALUE} is not valid"
    },
    statusSekolah:{
        type: String,
        enum: ["swasta", "negeri"],
        message: "{VALUE} is not valid"
    },
    jenjangPendidikan:{
        type: String,
        enum: ["pendidikan anak usia dini", "pendidikan dasar", "pendidikan menengah"],
        message: "{VALUE} is not valid"
    },
    satuanPendidikan:{
        type: String,
        enum: [
            "KB",
            "PAUD",
            "TK",
            "RA",
            "SD",
            "MI",
            "SMP",
            "MTS",
            "SMA",
            "SMK",
            "MA",
            "MAK"
        ],
        message: "{VALUE} is not valid"
    },
    address: {
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "Harus memiliki alamat"]
    },
})

const Sekolah = mongoose.model("Sekolah", modelSekolah);

module.exports = Sekolah