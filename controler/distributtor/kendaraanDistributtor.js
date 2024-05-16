const KendaraanDistributor = require('../../models/distributtor/model-kendaraanDistributtor')

module.exports = {
    getKendaraanDistributor: async (req, res, next) => {
        try {
            const data = await KendaraanDistributor.find()
            if (!data) return res.status(400).json({ message: "anda belom ngisis data Kendaraan" })

            res.status(200).json({
                message: "get data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    getKendaraanDistributorById: async (req, res, next) => {
        try {
            const data = await KendaraanDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: "get data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    createKendaraandistributtor: async (req, res, next) => {
        try {
            const { id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun } = req.body

            const data = await KendaraanDistributor.create({ id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    updateKendaraanDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun } = req.body

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun }, { new: true })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    deleteKendaraanDistributtor: async (req, res, next) => {
        try {
            const data = await KendaraanDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            await KendaraanDistributor.deleteOne({ _id: req.params.id })

            res.status(200).json({
                message: "delete data success"
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    }
}
