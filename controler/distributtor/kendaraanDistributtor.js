const KendaraanDistributor = require('../../models/distributor/model-kendaraanDistributtor')
const Vendor = require('../../models/vendor/model-vendor')
const { calculateDistance } = require('../../utils/menghitungJarak')

module.exports = {
    getKendaraanDistributor: async (req, res, next) => {
        try {
            const { orderId } = req.body

            const orderData = await Pesanan.findById(orderId).populate({
                path: 'product.productId',
                populate: {
                    path: 'categoryId',
                },
                populate: {
                    path: 'userId',
                    select: '-password'
                },
            })
                .populate('userId', '-password').populate('addressId')

            const latitudeUser = parseFloat(orderData.addressId.pinAlamat.lat)
            const longitudeUser = parseFloat(orderData.addressId.pinAlamat.long);


            let addresVendor = {}
            for (let vendor of orderData.product) {
                const vendorId = vendor.productId.userId._id ? vendor.productId.userId._id : null
                addresVendor = await Vendor.findOne({ userId: vendorId }).populate('address')
            }

            const latitudeVendor = parseFloat(addresVendor.address.pinAlamat.lat)
            const longitudeVendor = parseFloat(addresVendor.address.pinAlamat.long)

            const distance = calculateDistance(latitudeUser, longitudeUser, latitudeVendor, longitudeVendor, 25);

            if (isNaN(distance)) {
                return res.status(400).json({ message: "Distance exceeds the maximum allowed" });
            }

            const data = await KendaraanDistributor.find()
            if (!data) return res.status(400).json({ message: "anda belom ngisis data Kendaraan" })

            res.status(200).json({
                message: "get data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    getKendaraanDistributorById: async (req, res, next) => {
        try {
            const data = await KendaraanDistributor.findOne({ id_distributor: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: "get data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    createKendaraandistributtor: async (req, res, next) => {
        try {
            const { id_distributor, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun } = req.body

            const data = await KendaraanDistributor.create({ id_distributor, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    updateKendaraanDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun } = req.body

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun }, { new: true })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    deleteKendaraanDistributtor: async (req, res, next) => {
        try {
            const data = await KendaraanDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            await KendaraanDistributor.deleteOne({ _id: req.params.id })

            res.status(200).json({
                message: "delete data success"
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    }
}
