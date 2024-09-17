const RekeningDistributor = require('../../models/distributor/module-rekeningDistributor')

module.exports = {
    getAllRekeningDistributor: async (req, res, next) => {
        try {
            const datas = await RekeningDistributor.find({ id_distributor: req.params.id })
            if (!datas) return res.status(400).json({ message: "anda belom memiliki rekening" })

            res.status(200).json({
                message: "get All data success",
                datas
            })
        } catch (error) {
            console.error(error);
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

    createRekeningDistributor: async (req, res, next) => {
        try {
            const { id_distributor, bank, no_rekening, nama_lengkap, rekening_utama } = req.body

            const createData = await RekeningDistributor.create({ id_distributor, bank, no_rekening, nama_lengkap, rekening_utama })

            res.status(201).json({
                message: 'create data success',
                data: createData
            })
        } catch (error) {
            console.error(error);
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

    updateRekeningDistributor: async (req, res, next) => {
        try {
            const { id_distributor, bank, no_rekening, nama_lengkap } = req.body

            const data = await RekeningDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            const createData = await RekeningDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_distributor, bank, no_rekening, nama_lengkap }, { new: true })

            res.status(201).json({
                message: 'create data success',
                data: createData
            })
        } catch (error) {
            console.error(error);
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

    deleteRekeningDistributor: async (req, res, next) => {
        try {
            const data = await RekeningDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            await RekeningDistributor.deleteOne({ _id: req.params.id })

            res.status(200).json({ message: "delete data success" })
        } catch (error) {
            console.error(error);
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