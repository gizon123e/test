const path = require("path");
const { Pangan, KelompokPangan, KebutuhanGizi } = require("../models/model-pangan");
const fs = require('fs')
const env = require('dotenv');
env.config()
module.exports = {
    uploadKelompokPangan: async (req, res, next) => {
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

            return res.status(200).json({ message: "Berhasil Menambah Kelompok Pangan" })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllKelompokPangan: async (req, res, next) => {
        try {
            const data = await KelompokPangan.find().lean();
            return res.status(200).json({ message: "Berhasil Mendapatkan data", data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getPanganByKelompok: async (req, res, next) => {
        try {
            const { kelompok_pangan, jenis_pangan } = req.query
            if (!kelompok_pangan || !jenis_pangan) return res.status(400).json({ message: "Query yang diperlukan tidak dikirim!" })
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
            return res.status(200).json({ message: "Berhasil Mendapatkan data", data: dataPangan });
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getKebutuhanGizi: async (req, res, next) => {
        try {
            const data = await KebutuhanGizi.find();
            return res.status(200).json({ message: "Berhasil Mendapatkan Data", data })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getDetailPangan: async (req, res, next) => {
        try {
            const data = await Pangan.findById(req.params.id);
            if (!data) return res.status(404).json({ message: `Data pangan dengan id: ${req.params.id} tidak ditemukan` })
            return res.status(200).json({ message: "Berhasil mendapatkan data", data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    searchPanganByName: async (req, res, next) => {
        try {
            const { nama } = req.query;
            const pangan = await Pangan.find({
                nama_bahan: {
                    $regex: new RegExp(nama, 'i')
                }
            }).select('kode_bahan nama_bahan kelompok_pangan jenis_pangan nama_makanan_lokal mayoritas_daerah_lokal keterangan').lean()
            if (pangan.length === 0) return res.status(404).json({ message: "Data tidak ditemukan" })
            return res.status(200).json({ message: "Berhasil mendapatkan data", data: pangan })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllPangan: async (req, res, next) => {
        try {
            const pangan = await Pangan.find()
            if (!pangan) return res.status(400).json({ message: 'data saat ini masi kosong' })

            res.status(200).json({
                message: "get All data success",
                datas: pangan
            })

        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}