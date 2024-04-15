const Distributtor = require('../../models/distributtor/model-distributtor')

module.exports = {
    getAllDistributtor: async (req, res, next) => {
        try {
            if (req.user.role === 'distributtor') {
                const dataDistributtor = await Distributtor.find({ userId: req.user.id }).populate('userId', '-password').populate('addressId')
                return res.status(200).json({
                    message: 'get data all distributtor success',
                    datas: dataDistributtor
                })
            }
            const dataDistributtor = await Distributtor.find().populate('userId', '-password').populate('addressId')
            return res.status(200).json({
                message: 'get data all distributtor success',
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

    createDistributtor: async (req, res, next) => {
        try {
            const { name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, addressId, image_sim, image_ktp } = req.body

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telepon)) return res.status(400).json({ error: 'no telepon tidak valid' })

            if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

            const dataDistributtor = await Distributtor.create({
                name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, userId: req.user.id, addressId, image_sim, image_ktp
            })

            res.status(201).json({
                message: 'create data distributtor success',
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

    updateDistributtor: async (req, res, next) => {
        try {
            const { name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, addressId, image_sim, image_ktp } = req.body

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telepon)) return res.status(400).json({ error: 'no telepon tidak valid' })

            const dataDistributtor = await Distributtor.findByIdAndUpdate({ _id: req.params.id }, {
                name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, userId: req.user.id, addressId, image_sim, image_ktp
            }, { new: true })

            res.status(201).json({
                message: 'create data distributtor success',
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

    deleteDistributtor: async (req, res, next) => {
        try {
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