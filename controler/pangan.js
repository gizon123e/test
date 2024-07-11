const path = require("path");
const { Pangan, KelompokPangan, KebutuhanGizi } = require("../models/model-pangan");
const fs = require('fs')
const env = require('dotenv');
env.config()
module.exports = {
    uploadKelompokPangan: async( req, res, next ) => {
        try {
            const { icon } = req.files;
            const { nama, deskripsi } = req.body;
            const fileName = `${nama}${path.extname(icon.name)}`
            const filePath = path.join(__dirname, '../public', 'icon', fileName);
            const urlFile = `${process.env.HOST}public/icon/${fileName}`
            await icon.mv(filePath);

            await KelompokPangan.create({
                nama,
                deskripsi,
                icon: urlFile
            });

            return res.status(200).json({message: "Berhasil Menambah Kelompok Pangan"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllKelompokPangan: async( req, res, next ) => {
        try {
            const data = await KelompokPangan.find().lean();
            return res.status(200).json({message: "Berhasil Mendapatkan data", data})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getPanganByKelompok: async (req, res, next) => {
        try {
            const { kelompok_pangan, jenis_pangan } = req.query
            if(!kelompok_pangan || !jenis_pangan) return res.status(400).json({message: "Body yang diperlukan tidak dikirim!"})
            const dataPangan = await Pangan.aggregate([
                {
                    $match: {
                        kelompok_pangan: { $regex: new RegExp(`^${kelompok_pangan}$`, 'i') },
                        jenis_pangan: { $regex: new RegExp(`^${jenis_pangan}$`, 'i') }
                    }
                },
                {
                    $addFields: {
                        nutrisi: [
                            "air",
                            "energi",
                            "protein",
                            "lemak",
                            "karbohidrat",
                            "serat",
                            "kalsium",
                            "fosfor",
                            "besi",
                            "natrium",
                            "kalium",
                            "tembaga",
                            "thiamin",
                            "riboflavin",
                            "vitamin_c"
                        ]
                    }
                },
                {
                    $unset: [
                        "air",
                        "energi",
                        "protein",
                        "lemak",
                        "kh",
                        "serat",
                        "kalsium",
                        "fosfor",
                        "besi",
                        "natrium",
                        "kalium",
                        "tembaga",
                        "thiamin",
                        "riboflavin",
                        "vitc",
                        "__v"
                    ]
                },
                {
                    $project: {
                        nama_bahan: 1,
                        nutrisi: 1
                    }
                }
            ]);
            return res.status(200).json({message: "Berhasil Mendapatkan data", data: dataPangan});
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getKebutuhanGizi: async(req, res, next) => {
        try {
            const data = await KebutuhanGizi.find();
            return res.status(200).json({message: "Berhasil Mendapatkan Data", data})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}