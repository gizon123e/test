const LayananInstansi = require('../../models/sekolah/layanan-instansi')

module.exports = {
    getAllInstansi: async (req, res, next) => {
        try {
            const data = await LayananInstansi.find()
            if (!data) return res.status(400).json({ message: "data saat ini masi kosong" })

            res.status(200).json({
                message: "get All data success",
                data
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            };
            next(error);
        }
    },

    createDataInstansi: async (req, res, next) => {
        try {
            const data = await LayananInstansi.create({ nama: req.body.nama })

            res.status(200).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            };
            next(error);
        }
    }
}