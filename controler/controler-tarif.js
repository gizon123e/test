const Tarif = require('../models/model-tarif')

module.exports = {
    getListTarif: async (req, res, next) => {
        try {
            const data = await Tarif.find()

            res.status(200).json({
                message: "get Tarif success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getByIdTrif: async (req, res, next) => {
        try {
            const data = await Tarif.findById(req.params.id)

            if (!data) return res.status(404).json({ message: 'data Not Found' })

            res.status(200).json({
                message: "get by id Tarif success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createTarif: async (req, res, next) => {
        try {
            const { jenis_kendaraan, jenis_jasa, tarif_dasar, tarif_per_km } = req.body
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}