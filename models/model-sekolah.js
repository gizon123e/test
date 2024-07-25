const mongoose = require('mongoose');

const modelSekolah = new mongoose.Schema({
    namaSekolah: {
        type: String,
        required: [true, "Harus memiliki namaSekolah"],
    },
    NPSN: {
        type: Number,
        required: [true, "Harus memiliki NPSN"],
        unique: [true, 'NPSN sudah terdaftar']
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "Harus memiliki userId"]
    },
    detailId: {
        type: mongoose.Types.ObjectId,
        ref: "Konsumen",
        required: [true, "Harus memiliki detailId"]
    },
    jumlahMurid: {
        type: Number,
        required: [true, "Harus memiliki jumlahMurid"]
    },
    kelas: [
        {
            _id: false,
            namaKelas: {
                type: String
            },
            jumlahMuridKelas: {
                type: Number
            }
        }
    ],
    // dataMurids: [
    //     {
    //         _id: false,
    //         nama: {
    //             type: String
    //         },
    //         gender: {
    //             type: String,
    //             enum: ["perempuan", "laki-laki"]
    //         },
    //         nik: {
    //             type: String
    //         },
    //         nisn: {
    //             type: String
    //         },
    //         pict: {
    //             type: String
    //         }
    //     }
    // ],
    jenisPendidikan: {
        type: String,
        enum: ["formal", "non-formal"],
        message: "{VALUE} is not valid",
        required: [true, "Harus memiliki jenisPendidikan"]
    },
    statusSekolah: {
        type: String,
        enum: ["swasta", "negeri"],
        message: "{VALUE} is not valid",
        required: [true, "Harus memiliki statusSekolah"]
    },
    jenjangPendidikan: {
        type: String,
        enum: ["pendidikan anak usia dini", "pendidikan dasar", "pendidikan menengah"],
        message: "{VALUE} is not valid",
        required: [true, "Harus memiliki jenjangPendidikan"]
    },
    satuanPendidikan: {
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
        message: "{VALUE} is not valid",
        required: [true, "Harus memiliki satuanPendidikan"]
    },
    address: {
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "Harus memiliki address"]
    },
    logoSekolah: {
        type: String,
        required: [true, "Harus memiliki logoSekolah"]
    }
}, { timestamps: true })

const Sekolah = mongoose.model("Sekolah", modelSekolah);

module.exports = Sekolah