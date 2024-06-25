const Tarif = require('../models/model-tarif')

module.exports = {
    getListTarif: async (req, res, next) => {
        try {
            const data = await Tarif.find().populate("jenis_kendaraan")

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

            const data = await Tarif.create({ jenis_kendaraan, jenis_jasa, tarif_dasar, tarif_per_km })

            res.status(201).json({
                message: "create data Tarif success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateTarif: async (req, res, next) => {
        try {
            const { jenis_kendaraan, jenis_jasa, tarif_dasar, tarif_per_km } = req.body

            const dataTarif = await Tarif.findById(req.params.id)
            if (!dataTarif) return res.status(404).json({ message: 'data Not Found' })

            const data = await Tarif.findByIdAndUpdate(req.params.id, { jenis_kendaraan, jenis_jasa, tarif_dasar, tarif_per_km }, { new: true })

            res.status(201).json({
                message: "update data Tarif success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    deleteTarif: async (req, res, next) => {
        try {
            const dataTarif = await Tarif.findById(req.params.id)
            if (!dataTarif) return res.status(404).json({ message: 'data Not Found' })

            await Tarif.deleteOne({ _id: req.params.id })

            res.status(200).json({ message: 'delete success' })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}