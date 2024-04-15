const Category = require('../models/model-category')

module.exports = {
    getCategory: async (req, res, next) => {
        try {
            const dataCategory = await Category.find()
            return res.status(200).json({ datas: dataCategory })
        } catch (error) {
            res.status(500).json({
                error,
                message: "Internal Error Server"
            })
        }
    },

    createCategory: async (req, res, next) => {
        try {
            const dataCategory = await Category.create({ name: req.body.name })
            return res.status(201).json({ datas: dataCategory })
        } catch (error) {
            res.status(500).json({
                error,
                message: "Internal Error Server"
            })
        }
    },

    updateCategory: async (req, res, next) => {
        try {
            const dataCategory = await Category.findByIdAndUpdate({ _id: req.params.id }, { name: req.body.name }, { new: true })
            return res.status(201).json({
                message: 'Update Category success',
                datas: dataCategory
            })
        } catch (error) {
            res.status(500).json({
                error,
                message: "Internal Error Server"
            })
        }
    },

    deleteCategory: async (req, res, next) => {
        try {
            const dataCategory = await Category.findOne({ _id: req.params.id })
            if (!dataCategory) return res.status(404).json({ message: 'delete data category not found' })

            await Category.deleteOne({ _id: req.params.id })
            res.status(200).json({ message: 'delete success' })
        } catch (error) {
            res.status(500).json({
                error,
                message: "Internal Error Server"
            })
            next(error)
        }
    }
}