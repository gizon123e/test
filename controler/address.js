const Address = require('../models/models-address')

module.exports = {
    getAddress: async (req, res, next) => {
        try {
            const dataAddress = await Address.find({ userId: req.user.id })
            return res.status(200).json({ message: 'get data all Address success', datas: dataAddress })
        } catch (error) {
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

    createAddress: async (req, res, next) => {
        try {
            const { province, regency, subdistrict, village, code_pos, address_description } = req.body

            const dataAddress = await Address.create({ province, regency, subdistrict, village, code_pos, address_description, userId: req.user.id })
            return res.status(201).json({ message: 'create data address success', datas: dataAddress })
        } catch (error) {
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

    updateAddress: async (req, res, next) => {
        try {
            const { province, regency, subdistrict, village, code_pos, address_description } = req.body
            const dataAddress = await Address.findByIdAndUpdate({ _id: req.params.id }, { province, regency, subdistrict, village, code_pos, address_description, userId: req.user.id }, { new: true })
            return res.status(201).json({ message: 'create data address success', datas: dataAddress })
        } catch (error) {
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

    deleteAddress: async (req, res, next) => {
        try {
            const dataAddress = await Address.findOne({ _id: req.params.id })
            if (!dataAddress) return res.status(404).json({ message: 'delete data address not found' })

            await Address.deleteOne({ _id: req.params.id })
            return res.status(200).json({ message: 'delete data success' })
        } catch (error) {
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