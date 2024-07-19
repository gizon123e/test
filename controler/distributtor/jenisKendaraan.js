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
            const { jenis, description, ukuran, umurKendaraan } = req.body
            const files = req.files
            const iconAktif = files ? files.icon_aktif : null
            const iconDisable = files ? files.icon_disable : null
            const iconDistributor = files ? files.icon_distributor : null

            if (!iconAktif || !iconDisable || !iconDistributor) return res.status(400).json({ message: "isi file data error" })

            const imageIconAktif = `${Date.now()}${path.extname(iconAktif.name)}`;
            const imagePathIconAktif = path.join(__dirname, '../../public/icon-kendaraan', imageIconAktif);

            const imageIconDistributor = `${Date.now()}${path.extname(iconDistributor.name)}`;
            const imagePathIconDistributor = path.join(__dirname, '../../public/icon-kendaraan', imageIconDistributor);

            const imageIconDisable = `${Date.now()}${path.extname(iconDisable.name)}`;
            const imagePathIconDisable = path.join(__dirname, '../../public/icon-kendaraan', imageIconDisable);

            await iconAktif.mv(imagePathIconAktif);
            await iconDisable.mv(imagePathIconDisable)
            await iconDistributor.mv(imagePathIconDistributor)

            const kendaraan = await JenisKendaraan.create({
                jenis,
                description,
                ukuran,
                icon_aktif: `${process.env.HOST}public/icon-kendaraan/${imageIconAktif}`,
                icon_disable: `${process.env.HOST}public/icon-kendaraan/${imageIconDisable}`,
                icon_distributor: `${process.env.HOST}public/icon-kendaraan/${imageIconDistributor}`,
                umurKendaraan
            })

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
            const { jenis, description, ukuran, umurKendaraan } = req.body
            const files = req.files
            const iconAktif = files ? files.icon_aktif : null
            const iconDisable = files ? files.icon_disable : null
            const iconDistributor = files ? files.icon_distributor : null

            const validateJenisKendaraan = await JenisKendaraan.findOne({ _id: req.params.id })
            if (!validateJenisKendaraan) return res.status(404).json({ message: "data Not Found" })

            let iconAktifName
            let iconDisableName
            if (validateJenisKendaraan.icon_aktif && validateJenisKendaraan.icon_disable) {
                iconAktifName = path.basename(validateJenisKendaraan.icon_aktif);
                iconDisableName = path.basename(validateJenisKendaraan.icon_disable);
            }

            if (iconAktifName) {
                const currentIconAktifPath = path.join(__dirname, '../../public/icon-kendaraan', iconAktifName);

                if (fs.existsSync(currentIconAktifPath)) {
                    fs.unlinkSync(currentIconAktifPath);
                }
            }

            if (iconDisableName) {
                const currentIconDisablePath = path.join(__dirname, '../../public/icon-kendaraan', iconDisableName);

                if (fs.existsSync(currentIconDisablePath)) {
                    fs.unlinkSync(currentIconDisablePath);
                }
            }

            const imageIconAktif = `${Date.now()}${path.extname(iconAktif.name)}`;
            const imagePathIconAktif = path.join(__dirname, '../../public/icon-kendaraan', imageIconAktif);

            await iconAktif.mv(imagePathIconAktif);

            const imageIconDisable = `${Date.now()}${path.extname(iconDisable.name)}`;
            const imagePathIconDisable = path.join(__dirname, '../../public/icon-kendaraan', imageIconDisable);

            await iconDisable.mv(imagePathIconDisable);

            const imageIconDistributor = `${Date.now()}${path.extname(iconDistributor.name)}`;
            const imagePathIconDistributor = path.join(__dirname, '../../public/icon-kendaraan', imageIconDistributor);

            await iconDistributor.mv(imagePathIconDistributor);

            const kendaraan = await JenisKendaraan.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    jenis,
                    description,
                    ukuran,
                    icon_aktif: `${process.env.HOST}public/icon-kendaraan/${imageIconAktif}`,
                    icon_disable: `${process.env.HOST}public/icon-kendaraan/${imageIconDisable}`,
                    icon_distributor: `${process.env.HOST}public/icon-kendaraan/${imageIconDistributor}`,
                    umurKendaraan
                },
                { new: true }
            )
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