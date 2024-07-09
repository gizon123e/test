const mongoose = require('mongoose');

const modelSimulasiSekolah = new mongoose.Schema({
    namaSekolah: {
        type: String
    },
    NPSN:{
        type: Number,
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
    }
})

const SimulasiSekolah = mongoose.model("SimulasiSekolah", modelSimulasiSekolah);
module.exports = SimulasiSekolah