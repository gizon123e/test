const JenisJasaDistributor = require('../../models/distributor/jenisJasaDistributor')
const path = require("path")
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    getAllJenisJasaDistributor: async (req, res, next) => {
        try {
            const data = await JenisJasaDistributor.find()

            res.status(200).json({
                message: "get all data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createJenisJasaDistributor: async (req, res, next) => {
        try {
            const { nama, description } = req.body
            const files = req.files;
            const icon = files ? files.icon : null

            if (!icon) return res.status(400).json({ message: "kamu gagal masukan icon file" })

            const imageIcon = `${Date.now()}${path.extname(icon.name)}`;
            const imagePathIcon = path.join(__dirname, '../../public/icon-kendaraan', imageIcon);

            await icon.mv(imagePathIcon);

            const data = await JenisJasaDistributor.create({
                nama,
                description,
                icon: `${process.env.HOST}/public/icon-kendaraan/${imageIcon}`
            })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateJenisJasaDistributor: async (req, res, next) => {
        try {
            const { nama, description } = req.body
            const files = req.files;
            const icon = files ? files.icon : null

            if (!icon) return res.status(400).json({ message: "kamu gagal masukan icon file" })

            const validateJasaDistributor = await JenisJasaDistributor.findOne({ _id: req.params.id })
            if (!validateJasaDistributor) return res.status(400).json({ message: "data Not Found" })

            const iconPayload = path.basename(validateJasaDistributor.icon);
            const currentIconPayloadPath = path.join(__dirname, '../../public/icon-kendaraan', iconPayload);

            if (fs.existsSync(currentIconPayloadPath)) {
                fs.unlinkSync(currentIconPayloadPath);
            }

            const imageIcon = `${Date.now()}${path.extname(icon.name)}`;
            const imagePathIcon = path.join(__dirname, '../../public/icon-kendaraan', imageIcon);

            await icon.mv(imagePathIcon);

            const data = await JenisJasaDistributor.findByIdAndUpdate({ _id: req.params.id }, {
                nama,
                description,
                icon: `${process.env.HOST}/public/icon-kendaraan/${legalitasNpwp}`
            }, { new: true })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}