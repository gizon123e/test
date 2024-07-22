const PelacakanDistributorToko = require('../../models/distributor/pelacakanDistributorToko')

module.exports = {
    createPelacakanDistributorToko: async (req, res, next) => {
        try {
            const { id_distributor, id_address, latitude, longitude } = req.body

            const data = await PelacakanDistributorToko.create({ id_distributor, id_address, latitude, longitude })

            res.status(201).json({
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
                })
            }

            next(error);
        }
    },

    updatePelacakanDistributorToko: async (req, res, next) => {
        try {
            const { id_distributor, id_address, latitude, longitude, id } = req.body

            const data = await PelacakanDistributorToko.findByIdAndUpdate({ _id: id }, { id_distributor, id_address, latitude, longitude }, { new: true })

            res.status(201).json({
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
                })
            }

            next(error);
        }
    }
}