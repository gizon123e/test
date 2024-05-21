const AlamatDistributor = require('../../models/distributor/model-alamat-distributtor')
const PenanggungJawab = require('../../models/distributor/model-penanggungjawab-distributtor')

module.exports = {
    getPenanggungJawaDistributtor: async (req, res, next) => {
        try {
            const data = await PenanggungJawab.find()
            if (!data) return res.status(400).json({ message: 'anda belom mengisi data Penanggung Jawab Distributtor' })

            res.status(200).json({
                message: "get data Penanggung jawab success",
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

    getPenangungJawabDistributtorById: async (req, res, next) => {
        try {
            const data = await PenanggungJawab.findOne({ _id: req.params.id })

            if (!data) return res.status(404).json({ message: "data Not Found" })

            re.status(200).json({
                message: "get data by id success",
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

    createPenanggungJawabDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, nama_penanggungjawab, jabatan } = req.body

            const data = await AlamatDistributor.create({ id_distributor, nama_penanggungjawab, jabatan })

            res.status(201).json({
                message: "create data pennanggung jawab success",
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

    updatePenanggungJawabDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, nama_penanggungjawab, jabatan } = req.body

            const data = await AlamatDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_distributor, nama_penanggungjawab, jabatan }, { new: true })

            res.status(201).json({
                message: "update data pennanggung jawab success",
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

    deletePenanggungJawabDistributtor: async (req, res, next) => {
        try {
            const data = await AlamatDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            await AlamatDistributor.deleteOne({ _id: req.params.id })

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