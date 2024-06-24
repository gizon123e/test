const KendaraanDistributor = require('../../models/distributor/model-kendaraanDistributtor')
const TokoVendor = require('../../models/vendor/model-toko')
const Product = require('../../models/model-product')
const Konsumen = require('../../models/konsumen/model-konsumen')
const { calculateDistance } = require('../../utils/menghitungJarak')
const Address = require('../../models/model-address')
const Gratong = require('../../models/model-gratong')
const Distributtor = require('../../models/distributor/model-distributor')
const Tarif = require('../../models/model-tarif')
const BiayaTetap = require('../../models/model-biaya-tetap')
const Pengemudi = require('../../models/distributor/model-pengemudi')

const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    getKendaraanDistributor: async (req, res, next) => {
        try {
            if (req.user.role === "administrator") {
                const data = await KendaraanDistributor.find().populate("id_distributor").populate("jenisKendaraan").populate("merekKendaraan").populate('tarifId')
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

            const data = await KendaraanDistributor.find({ id_distributor: { $in: distributorIds } }).populate("id_distributor").populate("jenisKendaraan").populate("merekKendaraan").populate('tarifId')

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

    getKendaraanDistributorDetailPanel: async (req, res, next) => {
        try {
            const dataKendaraan = await KendaraanDistributor.findOne({ _id: req.params.id })
                .populate('tarifId')
                .populate({
                    path: "id_distributor",
                    populate: "alamat_id"
                })
                .populate('merekKendaraan')
                .populate("jenisKendaraan")
            if (!dataKendaraan) return res.status(404).json({ message: 'data Not Found' })

            res.status(200).json({
                message: 'get data success',
                data: dataKendaraan
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

            const ukuranVolumeMotor = 100 * 30 * 40
            let beratProduct = 0
            let volumeProduct = 0
            let hargaTotalVolume = 0
            for (let productId of product) {
                const dataProduct = await Product.findOne({ _id: productId.id }).populate('userId')
                const volumeBarang = dataProduct.panjang * dataProduct.lebar * dataProduct.tinggi
                const hitunganTotal = volumeBarang * productId.qty
                const hitungBerat = dataProduct.berat * productId.qty

                beratProduct += hitungBerat
                volumeProduct += hitunganTotal
            }

            if (volumeProduct > beratProduct) {
                const hargabarang = volumeProduct / dataBiayaTetap.constanta_volume
                hargaTotalVolume += hargabarang
            } else {
                const hargabarang = beratProduct / dataBiayaTetap.biaya_per_kg
                hargaTotalVolume += hargabarang
            }

            const addressVendor = await TokoVendor.findOne({ userId: userId }).populate('address')
            const latitudeVebdor = parseFloat(addressVendor.address.pinAlamat.lat)
            const longitudeVendor = parseFloat(addressVendor.address.pinAlamat.long)

            const dataKonsumen = await Konsumen.findOne({ userId: req.user.id }).populate("address")
            // const latitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.lat)
            // const longitudeKonsumen = parseFloat(dataKonsumen.address.pinAlamat.long)

            let distance

            const addressCustom = await Address.findOne({ _id: addressId })

            const latitudeAddressCustom = parseFloat(addressCustom.pinAlamat.lat)
            const longitudeAdressCustom = parseFloat(addressCustom.pinAlamat.long)
            distance = calculateDistance(latitudeAddressCustom, longitudeAdressCustom, latitudeVebdor, longitudeVendor, 100);
            console.log(distance)
            if (isNaN(distance)) {
                return res.status(400).json({
                    message: "Jarak antara konsumen dan vendor melebihi 100 km"
                });
            }

            // const distance = calculateDistance(-6.167350, 106.820926, -6.187499, 106.959382, 100);

            const jarakTempu = Math.round(distance)

            let data = []
            const dataKendaraan = await KendaraanDistributor.find({ id_distributor: req.params.id }).populate('tarifId')
                .populate({
                    path: "id_distributor",
                    populate: "alamat_id"
                })
                .populate('merekKendaraan')
                .populate("jenisKendaraan")
                .lean()

            if (!dataKendaraan) return res.status(404).json({ message: "data Not Found" })

            let filteredDataKendaraan = dataKendaraan;
            if (volumeProduct > ukuranVolumeMotor || beratProduct > ukuranVolumeMotor) {
                filteredDataKendaraan = dataKendaraan.filter(kendaraan => kendaraan.tarifId.jenis_kendaraan === 'mobil');
            } else {
                filteredDataKendaraan = dataKendaraan.filter(kendaraan => kendaraan.tarifId.jenis_kendaraan === 'motor');
            }

            for (let kendaraan of filteredDataKendaraan) {
                const gratong = await Gratong.findOne({ tarif: kendaraan.tarifId._id, startTime: { $lt: new Date() }, endTime: { $gt: new Date() } });

                if (jarakTempu > 4) {
                    let potongan_harga;
                    let total_ongkir;
                    const dataJara = jarakTempu - 4
                    const dataPerKM = dataJara * kendaraan.tarifId.tarif_per_km
                    let hargaOngkir = 0
                    if (hargaTotalVolume > 1) {
                        const hargaVolume = hargaTotalVolume * dataBiayaTetap.biaya_per_kg
                        hargaOngkir = (dataPerKM + kendaraan.tarifId.tarif_dasar) + hargaVolume
                    } else {
                        hargaOngkir = (dataPerKM + kendaraan.tarifId.tarif_dasar) + dataBiayaTetap.biaya_per_kg
                    }

                    if (gratong) {
                        kendaraan.isGratong = true
                        switch (gratong.jenis) {
                            case "persentase":
                                potongan_harga = hargaOngkir * gratong.nilai_gratong / 100
                                total_ongkir = hargaOngkir - potongan_harga
                                break;
                            case "langsung":
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
                        jarakTempu: Math.round(jarakTempu),
                        totalBeratProduct: beratProduct,
                        totalVolumeProduct: volumeProduct,
                        hargaOngkir: Math.round(hargaOngkir),
                        potongan_harga,
                        total_ongkir: Math.round(total_ongkir)
                    })
                } else {
                    let potongan_harga;
                    let total_ongkir;
                    let hargaOngkir = 0
                    if (hargaTotalVolume > 1) {
                        const hargaVolume = hargaTotalVolume * dataBiayaTetap.biaya_per_kg
                        hargaOngkir = kendaraan.tarifId.tarif_dasar + hargaVolume
                        console.log("jarakTempu", jarakTempu)
                        console.log("tarif dasar", kendaraan.tarifId.tarif_dasar)
                        console.log("hargaVolume", hargaVolume)
                    } else {
                        hargaOngkir = kendaraan.tarifId.tarif_dasar + dataBiayaTetap.biaya_per_kg
                    }

                    if (gratong) {
                        kendaraan.isGratong = true
                        switch (gratong.jenis) {
                            case "persentase":
                                potongan_harga = hargaOngkir * gratong.nilai_gratong / 100
                                total_ongkir = hargaOngkir - potongan_harga
                                break;
                            case "langsung":
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
                        jarakTempu: Math.round(jarakTempu),
                        totalBeratProduct: beratProduct,
                        totalVolumeProduct: volumeProduct,
                        hargaOngkir: Math.round(hargaOngkir),
                        potongan_harga,
                        total_ongkir: Math.round(total_ongkir)
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
            const { id_distributor, nama, jenisKelamin, tanggalLahir, jenisKendaraan, merekKendaraan, nomorPolisi, warna, typeKendaraan, tarifId } = req.body
            const files = req.files;
            const file_sim = files ? files.file_sim : null;
            const fotoKendaraan = files ? files.fotoKendaraan : null;
            const fileSTNK = files ? files.STNK : null;
            const fileKTP = files ? files.fileKTP : null;
            const profile = files ? files.profile : null;

            if (!file_sim || !fotoKendaraan || !fileSTNK || !fileKTP) return res.status(400).json({ message: "file Sim & fotoKendaraan & fileSTNK & fileKTP file gagal di unggah" })
            const imageName = `${Date.now()}${path.extname(file_sim.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-profile-distributtor', imageName);

            await file_sim.mv(imagePath);

            const imageNameKendaraan = `${Date.now()}${path.extname(fotoKendaraan.name)}`;
            const imagePathKendaraan = path.join(__dirname, '../../public/image-profile-distributtor', imageNameKendaraan);

            await fotoKendaraan.mv(imagePathKendaraan);

            const imageNameSTNK = `${Date.now()}${path.extname(fileSTNK.name)}`;
            const imagePathSTNK = path.join(__dirname, '../../public/image-profile-distributtor', imageNameSTNK);

            await fileSTNK.mv(imagePathSTNK);

            const imageNameProfile = `${Date.now()}${path.extname(profile.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await profile.mv(imagePathProfile);


            let dataPengemudi
            if (fileKTP) {
                const imageNameKTP = `${Date.now()}${path.extname(fileKTP.name)}`;
                const imagePathKTP = path.join(__dirname, '../../public/image-profile-distributtor', imageNameKTP);

                await fileKTP.mv(imagePathKTP);

                dataPengemudi = await Pengemudi.create({
                    id_distributor,
                    nama,
                    jenisKelamin,
                    tanggalLahir,
                    profile: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                    file_sim: `${process.env.HOST}public/image-profile-distributtor/${imageName}`,
                    fileKTP: `${process.env.HOST}public/image-profile-distributtor/${imageNameKTP}`,
                })
            } else {
                dataPengemudi = await Pengemudi.create({
                    id_distributor,
                    nama,
                    jenisKelamin,
                    tanggalLahir,
                    profile: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                    file_sim: `${process.env.HOST}public/image-profile-distributtor/${imageName}`,
                })
            }

            const data = await KendaraanDistributor.create({
                id_distributor,
                jenisKendaraan,
                merekKendaraan,
                nomorPolisi,
                warna,
                typeKendaraan,
                tarifId,
                fotoKendaraan: `${process.env.HOST}public/image-profile-distributtor/${imageNameKendaraan}`,
                STNK: `${process.env.HOST}public/image-profile-distributtor/${imageNameKendaraan}`,

            })

            res.status(201).json({
                message: "create data success",
                data,
                dataPengemudi
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

    createKendaraanPerusahaan: async (req, res, next) => {
        try {
            const { id_distributor, jenisKendaraan, merekKendaraan, nomorPolisi, warna, typeKendaraan, tarifId } = req.body
            const files = req.files;
            const fotoKendaraan = files ? files.fotoKendaraan : null;
            const fileSTNK = files ? files.STNK : null;

            const imageNameSTNK = `${Date.now()}${path.extname(fileSTNK.name)}`;
            const imagePathSTNK = path.join(__dirname, '../../public/image-profile-distributtor', imageNameSTNK);

            await fileSTNK.mv(imagePathSTNK);

            const imageNameProfile = `${Date.now()}${path.extname(fotoKendaraan.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await fotoKendaraan.mv(imagePathProfile);

            const data = await KendaraanDistributor.create({
                id_distributor,
                jenisKendaraan,
                merekKendaraan,
                nomorPolisi,
                warna,
                typeKendaraan,
                tarifId,
                fotoKendaraan: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                STNK: `${process.env.HOST}public/image-profile-distributtor/${imageNameSTNK}`,

            })

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
            const { id_distributor, jenisKendaraan, merekKendaraan, nomorPolisi, warna, typeKendaraan, tarifId } = req.body
            const files = req.files;
            const fotoKendaraan = files ? files.fotoKendaraan : null;
            const fileSTNK = files ? files.STNK : null;

            const imageNameSTNK = `${Date.now()}${path.extname(fileSTNK.name)}`;
            const imagePathSTNK = path.join(__dirname, '../../public/image-profile-distributtor', imageNameSTNK);

            await fileSTNK.mv(imagePathSTNK);

            const imageNameProfile = `${Date.now()}${path.extname(fotoKendaraan.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await fotoKendaraan.mv(imagePathProfile);

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, {
                id_distributor,
                jenisKendaraan,
                merekKendaraan,
                nomorPolisi,
                warna,
                typeKendaraan,
                tarifId,
                fotoKendaraan: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                STNK: `${process.env.HOST}public/image-profile-distributtor/${imageNameSTNK}`,

            }, { new: true })

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
    },

    veriifikasiKendaraan: async (req, res, next) => {
        try {
            const dataPengemudi = await KendaraanDistributor.findOne({ _id: req.params.id })
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { is_Active: true }, { new: true })

            res.status(200).json({
                message: "update data success",
                data
            })
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
    },

    tolakKenendaraan: async (req, res, next) => {
        try {
            const dataPengemudi = await KendaraanDistributor.findOne({ _id: req.params.id })
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { descriptionTolak: req.body.descriptionTolak }, { new: true })

            res.status(200).json({
                message: "update data success",
                data
            })
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
