const Distributtor = require('../../models/distributor/model-distributor')
const Vendor = require('../../models/vendor/model-vendor')
const Product = require('../../models/model-product')
const Konsumen = require('../../models/konsumen/model-konsumen')
const KendaraanDistributor = require('../../models/distributor/model-kendaraanDistributtor')
const Address = require('../../models/model-address')
const { calculateDistance } = require('../../utils/menghitungJarak')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    getDistributtorCariHargaTerenda: async (req, res, next) => {
        try {
            const { idAddress } = req.query

            const product = await Product.findOne({ _id: req.params.id }).populate('userId')
            const addressVendor = await Vendor.findOne({ userId: product.userId._id }).populate('address')
            const dataKonsumen = await Konsumen.findOne({ userId: req.user.id }).populate("address")

            const ukuranVolumeMotor = 100 * 30 * 40
            const ukuranVolumeProduct = product.tinggi * product.lebar * product.panjang

            const latitudeVendor = parseFloat(addressVendor.address.pinAlamat.lat)
            const longitudeVendor = parseFloat(addressVendor.address.pinAlamat.long)

            const latitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.lat)
            const longitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.long)

            let ongkir = calculateDistance(latitudeKonsumen, longitudeKonsumen, latitudeVendor, longitudeVendor, 100);

            if (idAddress) {
                const addressCustom = await Address.findById(idAddress)
                const latitudeAddressCustom = parseFloat(addressCustom.pinAlamat.lat)
                const longitudeAddressCustom = parseFloat(addressCustom.pinAlamat.long)
                ongkir = calculateDistance(latitudeAddressCustom, longitudeAddressCustom, latitudeVendor, longitudeVendor, 100);
                if (isNaN(ongkir)) {
                    return res.status(400).json({
                        message: "Jarak antara konsumen dan vendor melebihi 100 km"
                    });
                }
            }

            if (isNaN(ongkir)) {
                return res.status(400).json({
                    message: "Jarak antara konsumen dan vendor melebihi 100 km"
                });
            }

            const isHeavyOrLarge = product.berat < 20 || ukuranVolumeProduct < ukuranVolumeMotor;
            if (isHeavyOrLarge) {
                query.is_kendaraan = { $in: "Motor" };
            }

            let dataAllDistributtor = []
            const dataDistributtor = await Distributtor.find().populate("userId", '-password').populate('alamat_id')

            if (!dataDistributtor) return res.status(400).json({ message: "kamu belom ngisi data yang lengkap" })

            for (let distributor of dataDistributtor) {
                const latitudeDistributtot = parseFloat(distributor.alamat_id.pinAlamat.lat)
                const longitudeDistributtor = parseFloat(distributor.alamat_id.pinAlamat.long)

                const distance = calculateDistance(latitudeDistributtot, longitudeDistributtor, latitudeVendor, longitudeVendor, 50);

                if (Math.round(distance) < 50 && distance !== NaN) {
                    const dataKendaraan = await KendaraanDistributor.find({ id_distributor: distributor._id }).populate('id_distributor').populate("tarifId")

                    if (dataKendaraan.length > 0)
                        for (let data of dataKendaraan) {

                            const jarakOngkir = Math.round(ongkir)
                            if (jarakOngkir > 4) {
                                const angkaJarak = jarakOngkir - 4
                                const hargaKiloMeter = angkaJarak * data.tarifId.tarif_per_km
                                const hargaOngkir = hargaKiloMeter + data.tarifId.tarif_dasar

                                dataAllDistributtor.push({
                                    distributor: data,
                                    jarakTempu: Math.round(distance),
                                    hargaOngkir
                                })
                            }
                        }
                }
            }

            if (dataAllDistributtor.length > 0) {
                dataAllDistributtor.sort((a, b) => a.hargaOngkir - b.hargaOngkir);
            }

            const datas = dataAllDistributtor[0]
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

    getAllDistributtor: async (req, res, next) => {
        try {
            const { name, addressId } = req.query

            const product = await Product.findOne({ _id: req.params.id }).populate('userId')
            const addressVendor = await Vendor.findOne({ userId: product.userId._id }).populate('address')

            const ukuranVolumeMotor = 100 * 30 * 40
            const ukuranVolumeProduct = product.tinggi * product.lebar * product.panjang

            const latitudeVendor = parseFloat(addressVendor.address.pinAlamat.lat)
            const longitudeVendor = parseFloat(addressVendor.address.pinAlamat.long)

            const konsumenAddress = await Konsumen.findOne({ userId: req.user.id }).populate("address")
            const latitudeKonsumen = parseFloat(konsumenAddress.address.pinAlamat.lat)
            const longitudeKonsumen = parseFloat(konsumenAddress.address.pinAlamat.long)

            if (addressId) {
                const addressCustom = await Address.findById(addressId)
                const latitudeAddressCustom = parseFloat(addressCustom.pinAlamat.lat)
                const longitudeAddressCustom = parseFloat(addressCustom.pinAlamat.long)
                const jarakVendorKonsumen = calculateDistance(latitudeAddressCustom, longitudeAddressCustom, latitudeVendor, longitudeVendor, 100);
                if (isNaN(jarakVendorKonsumen)) {
                    return res.status(400).json({
                        message: "Jarak antara konsumen dan vendor melebihi 100 km"
                    });
                }
            } else {
                const jarakVendorKonsumen = calculateDistance(latitudeKonsumen, longitudeKonsumen, latitudeVendor, longitudeVendor, 100);
                if (isNaN(jarakVendorKonsumen)) {
                    return res.status(400).json({
                        message: "Jarak antara konsumen dan vendor melebihi 100 km"
                    });
                }
            }

            let query = {}
            if (name) {
                query.nama_distributor = { $regex: name, $options: 'i' }
            }

            const isHeavyOrLarge = product.berat < 20 || ukuranVolumeProduct < ukuranVolumeMotor;
            if (isHeavyOrLarge) {
                query.is_kendaraan = { $in: "Motor" };
            }

            let datas = []
            const dataDistributtor = await Distributtor.find(query).populate("userId", '-password').populate('alamat_id')

            if (!dataDistributtor) return res.status(400).json({ message: "kamu belom ngisi data yang lengkap" })

            for (let distributor of dataDistributtor) {
                const latitudeDistributtot = parseFloat(distributor.alamat_id.pinAlamat.lat)
                const longitudeDistributtor = parseFloat(distributor.alamat_id.pinAlamat.long)

                const distance = calculateDistance(latitudeDistributtot, longitudeDistributtor, latitudeVendor, longitudeVendor, 50);

                if (Math.round(distance) < 50 && distance !== NaN) {
                    const dataKendaraan = await KendaraanDistributor.find({ id_distributor: distributor._id })

                    if (dataKendaraan.length > 0)
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
            const { nama_distributor, no_telp, is_kendaraan, userId, alamat_id, jenisUsaha } = req.body
            const files = req.files;
            const imageDistributtor = files ? files.imageDistributtor : null;

            if (!imageDistributtor) {
                return res.status(400).json({ message: "kamu gagal masukan file imageDistributtor" });
            }

            const imageName = `${Date.now()}${path.extname(imageDistributtor.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-profile-distributtor', imageName);

            await imageDistributtor.mv(imagePath);

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telp.toString())) return res.status(400).json({ message: "no telepon tidak valid" })

            const data = await Distributtor.create({
                nama_distributor,
                no_telp,
                is_kendaraan,
                is_active: true,
                userId, alamat_id,
                imageDistributtor: `${process.env.HOST}public/image-profile-distributtor/${imageName}`,
                jenisUsaha
            })

            return res.status(201).json({
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

            next(error);
        }
    },

    updateDistributtor: async (req, res, next) => {
        try {
            const { nama_distributor, no_telp, is_kendaraan, jenisUsaha } = req.body
            const imageDistributtor = req.files ? req.files.imageDistributtor : null;

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telp.toString())) {
                return res.status(400).json({ error: 'no telepon tidak valid' })
            }

            const dataDistributtor = await Distributtor.findById(req.params.id)
            if (!dataDistributtor) return res.status(404).json({ message: "data Distributtor Not Found" })
            if (dataDistributtor.imageDistributtor) {
                const nibFilename = path.basename(dataDistributtor.imageDistributtor);

                const currentNibPath = path.join(__dirname, '../../public/image-profile-distributtor', nibFilename);
                if (fs.existsSync(currentNibPath)) {
                    fs.unlinkSync(currentNibPath);
                }
            }

            if (!imageDistributtor) {
                return res.status(400).json({ message: "kamu gagal masukan file imageDistributtor" });
            }

            const imageName = `${Date.now()}${path.extname(imageDistributtor.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-profile-distributtor', imageName);

            await imageDistributtor.mv(imagePath, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to upload imageDistributtor file", error: err });
                }
            });

            const data = await Distributtor.findByIdAndUpdate({ _id: req.params.id }, {
                nama_distributor,
                no_telp,
                is_kendaraan,
                imageDistributtor: `${process.env.HOST}/public/image-profile-distributtor/${imageName}`,
                jenisUsaha
            }, { new: true })

            res.status(201).json({
                message: "update data success",
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

    deleteDistributtor: async (req, res, next) => {
        try {
            const dataDistributtor = await Distributtor.findOne({ _id: req.params.id })
            if (!dataDistributtor) {
                return res.status(404).json({ error: `data id ${req.params.id} not found` })
            }

            const nibFilename = path.basename(dataDistributtor.imageDistributtor);

            const currentNibPath = path.join(__dirname, '../../public/image-profile-distributtor', nibFilename);
            if (fs.existsSync(currentNibPath)) {
                fs.unlinkSync(currentNibPath);
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