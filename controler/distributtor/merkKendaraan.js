const MerkKendaraan = require('../../models/distributor/model-merkKendaraan')

module.exports = {
    allKendaraan: async (req, res, next) => {
        try {
            const { jenisId } = req.query;
            let query = {};

            if (jenisId) {
                query = { jenis: jenisId };
            }

            const kendaraan = await MerkKendaraan.find(query).populate('jenis')
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
            const { jenis, merk } = req.body;

            if (!Array.isArray(jenis) || !jenis.length) {
                return res.status(400).json({ message: "jenis must be a non-empty array" });
            }
            const kendaraan = await MerkKendaraan.create({ jenis, merk })

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
            const { jenis, merk } = req.body;

            let updateData = { merk };
            if (Array.isArray(jenis) && jenis.length) {
                updateData.jenis = jenis;
            }

            const kendaraan = await MerkKendaraan.findByIdAndUpdate({ _id: req.params.id }, updateData, { new: true })
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
            const kendaraan = await MerkKendaraan.findOne({ _id: req.params.id })
            if (!kendaraan) return res.status(404).json({ message: "data Not Found" })

            await MerkKendaraan.deleteOne({ _id: req.params.id })

            res.status(200).json({
                message: "delete data success"
            })

        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}