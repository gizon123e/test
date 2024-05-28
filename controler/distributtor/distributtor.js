const Distributtor = require('../../models/distributor/model-distributor')
const Vendor = require('../../models/vendor/model-vendor')
const Product = require('../../models/model-product')
const { calculateDistance } = require('../../utils/menghitungJarak')

module.exports = {
    getAllDistributtor: async (req, res, next) => {
        try {
            //kasih filter maksimal untuk motor:
            //ukuran 100x30x40cm
            //berat 20kg
            const { name } = req.query

            const product = await Product.findOne({ _id: req.params.id }).populate('userId')
            const addressVendor = await Vendor.findOne({ userId: product.userId._id }).populate('address')

            const latitudeVendor = parseFloat(addressVendor.address.pinAlamat.lat)
            const longitudeVendor = parseFloat(addressVendor.address.pinAlamat.long)

            let query = {}
            if (name) {
                query.nama_distributor = { $regex: name, $options: 'i' }
            }

            let datas = []
            const dataDistributtor = await Distributtor.find(query).populate("userId", '-password').populate('alamat_id')

            if (!dataDistributtor) return res.status(400).json({ message: "kamu belom ngisi data yang lengkap" })

            for (let distributor of dataDistributtor) {
                const latitudeDistributtot = parseFloat(distributor.alamat_id.pinAlamat.lat)
                const longitudeDistributtor = parseFloat(distributor.alamat_id.pinAlamat.long)

                const distance = calculateDistance(latitudeDistributtot, longitudeDistributtor, latitudeVendor, longitudeVendor, 25);

                if (distance < 25) {
                    datas.push({
                        distributor,
                        jarakTempu: Math.round(distance)
                    })
                }
            }

            res.status(200).json({
                message: "success get data Distributtor",
                datas
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

    getDetailDistributtor: async (req, res, next) => {
        try {
            const data = await Distributtor.findOne({ _id: req.params.id }).populate("userId", '-password')

            if (!data) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: `get data by id ${req.params.id} suucess`,
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

    createDistributtor: async (req, res, next) => {
        try {
            const { nama_distributor, no_telp, is_kendaraan, userId, alamat_id } = req.body

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telp.toString())) return res.status(400).json({ message: "no telepon tidak valid" })

            const data = await Distributtor.create({ nama_distributor, no_telp, is_kendaraan, is_active: true, userId, alamat_id })

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