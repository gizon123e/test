const KendaraanDistributor = require('../../models/distributor/model-kendaraanDistributtor')
const Vendor = require('../../models/vendor/model-vendor')
const Product = require('../../models/model-product')
const Konsumen = require('../../models/konsumen/model-konsumen')
const { calculateDistance } = require('../../utils/menghitungJarak')
const Address = require('../../models/model-address')
const Gratong = require('../../models/model-gratong')
const Distributtor = require('../../models/distributor/model-distributor')
const Tarif = require('../../models/model-tarif')
const BiayaTetap = require('../../models/model-biaya-tetap')

const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    getKendaraanDistributor: async (req, res, next) => {
        try {
            if (req.user.role === "administrator") {
                const data = await KendaraanDistributor.find().populate("id_distributor").populate('tarifId')
                if (!data) return res.status(400).json({ message: "saat ini data masi kosong" })

                return res.status(200).json({
                    message: "get data success",
                    data
                })
            }
            console.log(req.user.role)
            const userId = req.user.id;

            const distributors = await Distributtor.find({ userId: userId });
            const distributorIds = distributors.map(distributor => distributor._id);

            const data = await KendaraanDistributor.find({ id_distributor: { $in: distributorIds } }).populate("id_distributor").populate('tarifId')
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
            const { userId, addressId } = req.query
            const { product = [] } = req.body

            const dataBiayaTetap = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" })

            let hargaBeratBarang = 0
            for (let productId of product) {
                const dataProduct = await Product.findOne({ _id: productId.id }).populate('userId')
                const valume = dataProduct.panjang * dataProduct.lebar * dataProduct.tinggi
                const hitungBerat = dataProduct.berat * productId.qty
                hargaBeratBarang = hitungBerat * dataBiayaTetap.biaya_per_kg
            }

            const addressVendor = await Vendor.findOne({ userId: userId }).populate('address')
            const latitudeVebdor = parseFloat(addressVendor.address.pinAlamat.lat)
            const longitudeVendor = parseFloat(addressVendor.address.pinAlamat.long)

            const dataKonsumen = await Konsumen.findOne({ userId: req.user.id }).populate("address")
            const latitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.lat)
            const longitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.long)

            let distance
            if (addressId) {
                const addressCustom = await Address.findById(addressId)

                const latitudeAddressCustom = parseFloat(addressCustom.pinAlamat.lat)
                const longitudeAdressCustom = parseFloat(addressCustom.pinAlamat.long)
                distance = calculateDistance(latitudeAddressCustom, longitudeAdressCustom, latitudeVebdor, longitudeVendor, 100);

                if (isNaN(distance)) {
                    return res.status(400).json({
                        message: "Jarak antara konsumen dan vendor melebihi 100 km"
                    });
                }
            } else {
                distance = calculateDistance(latitudeKonsumen, longitudeKonsumen, latitudeVebdor, longitudeVendor, 100);

                if (isNaN(distance)) {
                    return res.status(400).json({
                        message: "Jarak antara konsumen dan vendor melebihi 100 km"
                    });
                }
            }
            // const distance = calculateDistance(-6.167350, 106.820926, -6.187499, 106.959382, 100);

            const jarakTempu = Math.round(distance)

            let data = []
            const dataKendaraan = await KendaraanDistributor.find({ id_distributor: req.params.id }).populate('tarifId')
                .populate({
                    path: "id_distributor",
                    populate: "alamat_id"
                })
                .lean()

            if (!dataKendaraan) return res.status(404).json({ message: "data Not Found" })

            for (let kendaraan of dataKendaraan) {
                const gratong = await Gratong.findOne({ tarif: kendaraan.tarifId._id, startTime: { $lt: new Date() }, endTime: { $gt: new Date() } });


                if (jarakTempu > 4) {
                    let potongan_harga;
                    let total_ongkir;
                    const dataJara = jarakTempu - 4
                    const dataPerKM = kendaraan.tarifId.tarif_per_km * dataJara
                    const hargaOngkir = dataPerKM + kendaraan.tarifId.tarif_dasar
                    console.log('data per Km', dataPerKM)
                    console.log('data tarif', kendaraan.tarifId.tarif_dasar)
                    console.log('data berat', hargaBeratBarang)

                    if (gratong) {
                        kendaraan.isGratong = true
                        switch (gratong.jenis) {
                            case "persentase":
                                // console.log('harga sudah dikurangi diskon :', hargaOngkir * gratong.nilai_gratong / 100)
                                potongan_harga = hargaOngkir * gratong.nilai_gratong / 100
                                total_ongkir = hargaOngkir - potongan_harga
                                break;
                            case "langsung":
                                // console.log('harga sudah dikurangi diskon :', hargaOngkir - gratong.nilai_gratong)
                                potongan_harga = hargaOngkir - gratong.nilai_gratong;
                                total_ongkir = hargaOngkir - potongan_harga;
                                break;
                        }
                    } else {
                        kendaraan.isGratong = false
                        total_ongkir = hargaOngkir
                    }

                    data.push({
                        kendaraan,
                        hargaOngkir,
                        potongan_harga,
                        total_ongkir
                    })
                } else {
                    let potongan_harga;
                    let total_ongkir;
                    const hargaOngkir = kendaraan.tarifId.tarif_dasar + hargaBeratBarang
                    console.log('data berat', hargaBeratBarang)
                    console.log("data tarif", kendaraan.tarifId.tarif_dasar)
                    console.log(hargaOngkir)
                    if (gratong) {
                        kendaraan.isGratong = true
                        switch (gratong.jenis) {
                            case "persentase":
                                // console.log('harga sudah dikurangi diskon :', hargaOngkir * gratong.nilai_gratong / 100)
                                potongan_harga = hargaOngkir * gratong.nilai_gratong / 100
                                total_ongkir = hargaOngkir - potongan_harga
                                break;
                            case "langsung":
                                // console.log('harga sudah dikurangi diskon :', hargaOngkir - gratong.nilai_gratong)
                                potongan_harga = hargaOngkir - gratong.nilai_gratong;
                                total_ongkir = hargaOngkir - potongan_harga;
                                break;
                        }
                    } else {
                        kendaraan.isGratong = false
                        total_ongkir = hargaOngkir
                    }

                    data.push({
                        kendaraan,
                        hargaOngkir,
                        potongan_harga,
                        total_ongkir
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
            const { id_distributor, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun, tarifId } = req.body

            const data = await KendaraanDistributor.create({ id_distributor, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun, tarifId })

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
            const { id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun, tarifId } = req.body
            const iconKendaraan = req.files ? req.files.iconKendaraan : null;

            const dataIconKendaraanDistributor = await KendaraanDistributor.findById(req.params.id)
            if (!dataIconKendaraanDistributor) return res.status(404).json({ message: "data Not Found" })
            if (dataIconKendaraanDistributor.iconKendaraan) {
                const iconDistributor = path.basename(dataIconKendaraanDistributor.iconKendaraan);

                const deleteIcons = path.join(__dirname, '../../public/icon-kendaraan', iconDistributor);
                if (fs.existsSync(deleteIcons)) {
                    fs.unlinkSync(deleteIcons);
                }
            }

            if (req.user.role === "administrator") {
                if (!iconKendaraan) {
                    return res.status(400).json({ message: "kamu gagal masukan file icon Kendaraan" });
                }

                const imageName = `${Date.now()}${path.extname(iconKendaraan.name)}`;
                const imagePath = path.join(__dirname, '../../public/icon-kendaraan', imageName);

                await iconKendaraan.mv(imagePath, (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Failed to upload imageDistributtor file", error: err });
                    }
                })

                const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { iconKendaraan: `${process.env.HOST}/public/icon-kendaraan/${imageName}` }, { new: true })

                return res.status(201).json({
                    message: "update icon data success",
                    data
                })
            }

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_distributor, id_jenis_kendaraan, merk, tipe, tnkb, no_mesin, no_rangka, warna, tahun, tarifId }, { new: true })

            res.status(201).json({
                message: "update data kendaraan success",
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
    },

    updateIconKendaraan: async (req, res, next) => {
        try {
            const { jenis_kendaraan } = req.body
            const iconKendaraan = req.files ? req.files.iconKendaraan : null;
            console.log(jenis_kendaraan)

            if (!jenis_kendaraan || !iconKendaraan) {
                return res.status(400).json({ error: 'jenis_kendaraan and iconKendaraan are required' });
            }

            const imageName = `${Date.now()}${path.extname(iconKendaraan.name)}`;
            const imagePath = path.join(__dirname, '../../public/icon-kendaraan', imageName);

            await iconKendaraan.mv(imagePath, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to upload imageDistributtor file", error: err });
                }
            })

            const tarifIds = await Tarif.find({ jenis_kendaraan }).select('_id jenis_kendaraan');
            const tarifIdList = tarifIds.map(tarif => tarif._id);
            console.log(tarifIdList)

            const result = await KendaraanDistributor.updateMany(
                { tarifId: { $in: tarifIdList } },
                { iconKendaraan: `${process.env.HOST}/public/icon-kendaraan/${imageName}` }
            );

            res.status(200).json({
                message: 'iconKendaraan updated successfully',
                modifiedCount: result.nModified
            });
        } catch (error) {
            console.error(error);
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
