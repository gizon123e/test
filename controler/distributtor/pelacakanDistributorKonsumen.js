const PelacakanDistributorKonsumen = require('../../models/distributor/pelacakanDistributorKonsumen')

module.exports = {
    getTrekingDistributor: async (req, res) => {
        const { id_toko, id_address } = req.params;
        try {
            const location = await PelacakanDistributorKonsumen.findOne({ id_address, id_toko });
            if (!location) {
                return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
            }
            res.status(200).json({
                message: "get data succees",
                data: location
            });
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

    createPelacakanDistributorKonsumen: async (req, res, next) => {
        try {
            const { id_toko, id_address, latitude, longitude, id_distributor, id_pesanan } = req.body

            const data = await PelacakanDistributorKonsumen.create({ id_toko, id_address, latitude, longitude, id_distributor, id_pesanan })

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

    updatePelacakanDistributorKonsumen: async (req, res, next) => {
        try {
            const { id_toko, id_address, latitude, longitude, id, id_distributor } = req.body

            const data = await PelacakanDistributorKonsumen.findByIdAndUpdate({ _id: id }, { id_toko, id_address, latitude, longitude, id_distributor })

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