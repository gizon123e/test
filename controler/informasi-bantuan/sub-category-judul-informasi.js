const SubCategoryInformasiPertanyaan = require('../../models/informasi-bantuan/sub-category-informasibantuan')

module.exports = {
    getSubCategoryInformasiBantuan: async (req, res, next) => {
        try {
            const data = await SubCategoryInformasiPertanyaan.find({ id_categori_informasi_bantuan: req.params.id })

            res.status(200).json({
                message: "get data success",
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
            next(error)
        }
    },

    createSubCategoryInformasiBantuan: async (req, res, next) => {
        try {
            const { id_categori_informasi_bantuan, nama, type } = req.body

            const data = await SubCategoryInformasiPertanyaan.create({ id_categori_informasi_bantuan, nama, type })

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
            next(error)
        }
    },

    updateSubCategoryInformasiBantuan: async (req, res, next) => {
        try {
            const { id_categori_informasi_bantuan, nama, type } = req.body

            const dataUpdate = await SubCategoryInformasiPertanyaan.findByIdAndUpdate(req.params.id, { id_categori_informasi_bantuan, nama, type })

            res.status(200).json({
                message: "update data success",
                data: dataUpdate
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
            next(error)
        }
    },

    deleteSubCategoryInformasiBantuan: async (req, res, next) => {
        try {
            const dataValidate = await SubCategoryInformasiPertanyaan.findOne({ _id: req.paarams.id })
            if (!dataValidate) {
                return res.status(404).json({
                    message: "data Not Found"
                })
            }

            await SubCategoryInformasiPertanyaan.deleteOne({})
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    }
}