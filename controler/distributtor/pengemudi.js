const Pengemudi = require('../../models/distributor/model-pengemudi')
const path = require('path')

module.exports = {
    getPengemudiList: async (req, res, next) => {
        try {
            const dataPengemudi = await Pengemudi.find().populate("id_distributor")
            if (!dataPengemudi) return res.status(400).json({ message: "saat ini data kosong" })

            res.status(200).json({
                message: "get data success",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getPengemudiDetail: async (req, res, next) => {
        try {
            const dataPengemudi = await Pengemudi.findOne({ _id: req.params.id }).populate("id_distributor")
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: "get data success",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createPengemudi: async (req, res, next) => {
        try {
            const { id_distributor, nama, jenisKelamin, tanggalLahir, no_telepon } = req.body
            const files = req.files;
            const file_sim = files ? files.file_sim : null;
            const profile = files ? files.profile : null;
            const fileKTP = files ? files.fileKTP : null;

            if (!fileKTP || !profile || !file_sim) return res.status(400).json({ message: "file KTP / file Profile / file SIM gagal di masukan filenya" })

            const imageNameKTP = `${Date.now()}${path.extname(fileKTP.name)}`;
            const imagePathKTP = path.join(__dirname, '../../public/image-ktp', imageNameKTP);

            await fileKTP.mv(imagePathKTP);

            const imageNameProfile = `${Date.now()}${path.extname(profile.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await profile.mv(imagePathProfile);

            const imageName = `${Date.now()}${path.extname(file_sim.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-profile-distributtor', imageName);

            await file_sim.mv(imagePath);

            const regexNotelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNotelepon.test(no_telepon.toString())) return res.status(400).json({ message: "Nomor telepon tidak valid" });

            const dataPengemudi = await Pengemudi.create({
                id_distributor,
                nama,
                jenisKelamin,
                tanggalLahir,
                profile: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                file_sim: `${process.env.HOST}public/image-profile-distributtor/${imageName}`,
                no_telepon: no_telepon.toString(),
                fileKTP: `${process.env.HOST}public/image-ktp/${imageNameProfile}`,
                tanggalLahir
            })

            res.status(201).json({
                message: "create pengemudi success",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateVerifikasi: async (req, res, next) => {
        try {
            const dataPengemudi = await Pengemudi.findOne({ _id: req.params.id }).populate("id_distributor")
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            const data = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, { is_Active: true }, { new: true })

            res.status(200).json({
                message: "update data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    tolakPengemudi: async (req, res, next) => {
        try {
            const dataPengemudi = await Pengemudi.findOne({ _id: req.params.id }).populate("id_distributor")
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            const data = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, { descriptionTolak: req.body.descriptionTolak, is_Active: false }, { new: true })

            res.status(200).json({
                message: "update data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}