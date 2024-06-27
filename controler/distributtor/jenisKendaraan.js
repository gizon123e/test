const JenisKendaraan = require("../../models/distributor/jenisKendaraan")
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    getAllKendaraan: async (req, res, next) => {
        try {
            const kendaraan = await JenisKendaraan.find()
            if (!kendaraan) return res.status.json({ message: "data jenis kendaraan masi kosong" })

            res.status(200).json({
                message: "get data jenis kendaraan success",
                datas: kendaraan
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createKendaraan: async (req, res, next) => {
        try {
            const files = req.files
            const icon = files ? files.icon : null

            const imageIcon = `${Date.now()}${path.extname(icon.name)}`;
            const imagePathIcon = path.join(__dirname, '../../public/icon-kendaraan', imageIcon);

            await icon.mv(imagePathIcon);

            const kendaraan = await JenisKendaraan.create({ jenis: req.body.jenis, icon: `${process.env.HOST}public/icon-kendaraan/${imageIcon}` })

            res.status(200).json({
                message: "get data jenis kendaraan success",
                datas: kendaraan
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateKendaraan: async (req, res, next) => {
        try {
            const files = req.files
            const icon = files ? files.icon : null

            const validateJenisKendaraan = await JenisKendaraan.findOne({ _id: req.params.id })
            if (!validateJenisKendaraan) return res.status(404).json({ message: "data Not Found" })

            const iconFilename = path.basename(validateJenisKendaraan.icon);

            if (iconFilename) {
                const currentIconPath = path.join(__dirname, '../../public/icon-kendaraan', iconFilename);

                if (fs.existsSync(currentIconPath)) {
                    fs.unlinkSync(currentIconPath);
                }
            }

            const imageIcon = `${Date.now()}${path.extname(icon.name)}`;
            const imagePathIcon = path.join(__dirname, '../../public/icon-kendaraan', imageIcon);

            await icon.mv(imagePathIcon);

            const kendaraan = await JenisKendaraan.findByIdAndUpdate({ _id: req.params.id }, { jenis: req.body.jenis, icon: `${process.env.HOST}public/icon-kendaraan/${imageIcon}` }, { new: true })
            if (!kendaraan) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: "get data jenis kendaraan success",
                datas: kendaraan
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    deleteKendaraan: async (req, res, next) => {
        try {
            const kendaraan = await JenisKendaraan.findOne({ _id: req.params.id })
            if (!kendaraan) return res.status(404).json({ message: "data Not Found" })

            const iconFilename = path.basename(kendaraan.icon);
            const currentIconPath = path.join(__dirname, '../../public/icon-kendaraan', iconFilename);

            if (fs.existsSync(currentIconPath)) {
                fs.unlinkSync(currentIconPath);
            }

            await JenisKendaraan.deleteOne({ _id: req.params.id })

            res.status(200).json({
                message: "delete data success"
            })

        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}