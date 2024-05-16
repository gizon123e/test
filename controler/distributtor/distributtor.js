const Distributtor = require('../../models/distributtor/model-distributtor')
const User = require('../../models/model-auth-user')

module.exports = {
    getAllDistributtor: async (req, res, next) => {
        try {
            const dataDistributtor = await Distributtor.find().populate("userId", '-password')

            if (!dataDistributtor) return res.status(400).json({ message: "kamu belom ngisi data yang lengkap" })

            res.status(200).json({
                message: "success get data Distributtor",
                datas: dataDistributtor
            })
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

    getDetailDistributtor: async (req, res, next) => {
        try {
            const data = await Distributtor.findOne({ _id: req.params.id }).populate("userId", '-password')

            if (!data) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: `get data by id ${req.params.id} suucess`
            })

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

    createDistributtor: async (req, res, next) => {
        try {
            const { nama_distributor, no_telp, is_kendaraan, userId } = req.body

            const dataUser = await User.findOne({ _id: userId })
            if (!dataUser) return res.status(404).json({ message: `data user id ${userId} Not Found` })


            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telp.toString())) return res.status(400).json({ message: "no telepon tidak valid" })

            const data = await Distributtor.create({ nama_distributor, no_telp, is_kendaraan, is_active: true, userId })

            res.status(201).json({
                message: "create data success",
                data
            })

        } catch (error) {
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

    updateDistributtor: async (req, res, next) => {
        try {
            const { nama_distributor, no_telp, is_kendaraan } = req.body

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telp.toString())) {
                return res.status(400).json({ error: 'no telepon tidak valid' })
            }

            const data = await Distributtor.findByIdAndUpdate({ _id: req.params.id }, { nama_distributor, no_telp, is_kendaraan }, { new: true })

            res.status(201).json({
                message: "update data success",
                data
            })
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

    deleteDistributtor: async (req, res, next) => {
        try {
            const dataDistributtor = await Distributtor.findOne({ _id: req.params.id })
            if (!dataDistributtor) {
                return res.status(404).json({ error: `data id ${req.params.id} not found` })
            }

            await Distributtor.deleteOne({ _id: req.params.id })

            return res.status(200).json({ message: 'delete data Distributtor success' })
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