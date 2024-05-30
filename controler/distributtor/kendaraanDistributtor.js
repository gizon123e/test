const KendaraanDistributor = require('../../models/distributor/model-kendaraanDistributtor')
const Vendor = require('../../models/vendor/model-vendor')
const Product = require('../../models/model-product')
const Konsumen = require('../../models/konsumen/model-konsumen')
const { calculateDistance } = require('../../utils/menghitungJarak')

module.exports = {
    getKendaraanDistributor: async (req, res, next) => {
        try {
            const data = await KendaraanDistributor.find().populate("id_distributor")
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
            const { id } = req.query

            const product = await Product.findOne({ _id: id }).populate('userId')
            const addressVendor = await Vendor.findOne({ userId: product.userId._id }).populate('address')
            const latitudeVebdor = parseFloat(addressVendor.address.pinAlamat.lat)
            const longitudeVendor = parseFloat(addressVendor.address.pinAlamat.long)

            console.log('vendorLat', latitudeVebdor)
            console.log('vendortLong', longitudeVendor)

            const dataKonsumen = await Konsumen.findOne({ userId: req.user.id }).populate("address")
            const latitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.lat)
            const longitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.long)

            console.log("konsumenLat", latitudeKonsumen)
            console.log("konsumenLong", longitudeKonsumen)

            const distance = calculateDistance(latitudeKonsumen, longitudeKonsumen, latitudeVebdor, longitudeVendor, 100);
            // const distance = calculateDistance(-6.167350, 106.820926, -6.187499, 106.959382, 100);

            if (isNaN(distance)) {
                return res.status(400).json({
                    message: "Jarak antara konsumen dan vendor melebihi 100 km"
                });
            }

            const jarakTempu = Math.round(distance)
            console.log(jarakTempu)

            let data = []
            const dataKendaraan = await KendaraanDistributor.find({ id_distributor: req.params.id }).populate('tarifId')
                .populate({
                    path: "id_distributor",
                    populate: "alamat_id"
                })

            if (!dataKendaraan) return res.status(404).json({ message: "data Not Found" })

            for (let kendaraan of dataKendaraan) {
                if (jarakTempu > 4) {
                    const dataJara = jarakTempu - 4
                    const dataPerKM = kendaraan.tarifId.tarif_per_km * dataJara
                    const hargaOngkir = dataPerKM + kendaraan.tarifId.tarif_dasar
                    console.log(hargaOngkir)

                    data.push({
                        kendaraan,
                        hargaOngkir
                    })
                } else {
                    data.push({
                        kendaraan,
                        hargaOngkir: kendaraan.tarifId.tarif_dasar
                    })

                }
            }

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
