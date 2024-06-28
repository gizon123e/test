const TypeKendaraan = require("../../models/distributor/typeKendaraan")

module.exports = {
    getAllTypeKendaraan: async (req, res, next) => {
        try {
            const { idMerk, idJenis } = req.query
            let query = {}

            if (idMerk && idJenis) {
                query = {
                    jenisKendaraan: idJenis,
                    merk: idMerk
                }
            }

            const data = await TypeKendaraan.find(query).populate("jenisKendaraan").populate("merkKendaraan")

            res.status(200).json({
                message: "get All data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createTypeKendaraan: async (req, res, next) => {
        try {
            const { nama, jenisKendaraan, merk } = req.body

            const data = await TypeKendaraan.create({ nama, jenisKendaraan, merkKendaraan: merk })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateTypeKendaraan: async (req, res, next) => {
        try {
            const { nama, jenisKendaraan, merk } = req.body

            const validate = await TypeKendaraan.findOne({ _id: req.params.id })
            if (!validate) return res.status(404).json({ message: "data Not Found" })

            const data = await TypeKendaraan.findByIdAndUpdate({ _id: req.params.id }, { nama, jenisKendaraan, merkKendaraan: merk }, { new: true })

            res.status(201).json({
                message: "update data success",
                data
            })

        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    deletTypeKendaraan: async (req, res, next) => {
        try {
            const validate = await TypeKendaraan.findOne({ _id: req.params.id })
            if (!validate) return res.status(404).json({ message: "data Not Found" })

            await TypeKendaraan.deleteOne({ _id: req.params.id })

            res.status(200).json({ message: "delete success" })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}