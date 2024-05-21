const AlamatDistributor = require("../../models/distributor/model-alamat-distributtor")

module.exports = {
    getDataAlamatDistributtor: async (req, res, next) => {
        try {
            const data = await AlamatDistributor.find()
            if (!data) return res.status(400).json({ message: "anda masi belom ngisi data Alamat" })

            res.status(200).json({
                message: "get data alamat distributtor success",
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

    getDataAlamatDistributtorById: async (req, res, next) => {
        try {
            const dataByID = await AlamatDistributor.findOne({ _id: req.params.id })
            if (!dataByID) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: `get data by id ${req.params.id} success`,
                datas: dataByID
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

    createDataAlamatDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, alamat_lengkap, latitude, longitude } = req.body

            const data = await AlamatDistributor.create({ id_distributor, alamat_lengkap, latitude, longitude })

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

    updateDataAlamatDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, alamat_lengkap, latitude, longitude } = req.body

            const data = await AlamatDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_distributor, alamat_lengkap, latitude, longitude }, { new: true })
            if (!data) return res.status(404).json({ message: `data id ${req.params.id} Not Found` })

            res.status(201).json({
                message: "update data success",
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

    deleteDataAlamataDistributtor: async () => {
        try {
            const data = await AlamatDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            await AlamatDistributor.deleteOne({ _id: req.params.id })
            res.status(200).json({ message: "delete data success" })
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
