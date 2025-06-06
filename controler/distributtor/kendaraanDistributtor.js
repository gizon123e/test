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
const JenisKendaraan = require("../../models/distributor/jenisKendaraan")
const LayananKendaraanDistributor = require('../../models/distributor/layananKendaraanDistributor')

const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman')
const User = require('../../models/model-auth-user')
const TokoSupplier = require('../../models/supplier/model-toko')
const TokoProdusen = require('../../models/produsen/model-toko')
const { populate } = require('../../models/model-cart')
dotenv.config()

module.exports = {
    getKendaraanDistributor: async (req, res, next) => {
        try {
            const { status } = req.query
            if (req.user.role === "administrator") {
                const data = await KendaraanDistributor.find().populate("id_distributor").populate("jenisKendaraan").populate("merekKendaraan")

                if (!data || data.length === 0) return res.status(400).json({ message: "saat ini data masi kosong" })

                return res.status(200).json({
                    message: "get data success kendaraan",
                    data
                })
            }
            const userId = req.user.id;

            const distributors = await Distributtor.findOne({ userId: userId });

            let query = {
                id_distributor: distributors._id
            };

            if (status) {
                query.status = status;
            }

            const data = await KendaraanDistributor.find(query).populate("id_distributor").populate("jenisKendaraan").populate("merekKendaraan")

            if (!data || data.length === 0) return res.status(400).json({ message: "anda belom ngisis data Kendaraan" })

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

            if (volumeProduct <= ukuranVolumeMotor && beratProduct > 30000) {
                const total = beratProduct / 1000
                hargaTotalVolume = total
            } else if (volumeProduct <= ukuranVolumeMotor && beratProduct <= 30000) {
                const total = beratProduct / 1000
                hargaTotalVolume = total
            } else if (volumeProduct > ukuranVolumeMotor && beratProduct > 30000) {
                const beratVolume = volumeProduct / dataBiayaTetap.constanta_volume
                const beratAktual = beratProduct / 1000
                if (beratVolume > beratAktual) {
                    hargaTotalVolume = beratVolume
                } else {
                    hargaTotalVolume = beratAktual
                }
            } else {
                const total = volumeProduct / dataBiayaTetap.constanta_volume
                hargaTotalVolume = total
            }
            const user = await User.findById(userId).select("role");

            let addressDetail;

            switch (user.role) {
                case "vendor":
                    addressDetail = await TokoVendor.findOne({ userId: userId }).populate('address');
                    break;
                case "supplier":
                    addressDetail = await TokoSupplier.findOne({ userId: userId }).populate('address');
                    break
                default:
                    addressDetail = await TokoProdusen.findOne({ userId: userId }).populate('address');
                    break
            }

            const latDetail = parseFloat(addressDetail.address.pinAlamat.lat)
            const longDetaik = parseFloat(addressDetail.address.pinAlamat.long)

            let distance

            const addressCustom = await Address.findOne({ _id: addressId })

            const latitudeAddressCustom = parseFloat(addressCustom.pinAlamat.lat)
            const longitudeAdressCustom = parseFloat(addressCustom.pinAlamat.long)
            distance = await calculateDistance(latitudeAddressCustom, longitudeAdressCustom, latDetail, longDetaik, dataBiayaTetap.radius);
            if (isNaN(distance)) {
                return res.status(400).json({
                    message: `Jarak antara konsumen dan vendor melebihi ${dataBiayaTetap.radius} km`
                });
            }

            const jarakTempu = distance

            let data = []
            const dataKendaraan = await KendaraanDistributor.find({ id_distributor: req.params.id, status: 'Aktif' })
                .populate({
                    path: "id_distributor",
                    populate: "alamat_id"
                })
                .populate('merekKendaraan')
                .populate("jenisKendaraan")
                .lean()

            const dataLayananDistributor = []
            const processedCombinations = new Set()

            for (let kendaraan of dataKendaraan) {
                const dataLayanan = await LayananKendaraanDistributor.find({ id_distributor: kendaraan.id_distributor._id, jenisKendaraan: kendaraan.jenisKendaraan._id })
                    .populate({
                        path: "tarifId",
                        populate: "jenis_kendaraan",
                        populate: "jenis_jasa",

                    })
                    .populate({
                        path: "id_distributor",
                        populate: "alamat_id"
                    })
                    .populate("jenisKendaraan")
                    .lean()

                for (let data of dataLayanan) {

                    const dataParsingLayananDistributor = await LayananKendaraanDistributor.findOne({ _id: data._id })
                        .populate({
                            path: "tarifId",
                            populate: "jenis_kendaraan",
                            populate: "jenis_jasa"
                        })
                        .populate({
                            path: "id_distributor",
                            populate: "alamat_id"
                        })
                        .populate("jenisKendaraan")
                        .lean()

                    if (req.user.role === 'konsumen') {
                        if (dataParsingLayananDistributor.tarifId.jenis_jasa.nama === 'Standar') {
                            const key = `${dataParsingLayananDistributor.tarifId._id}_${dataParsingLayananDistributor.jenisKendaraan._id}`;
                            if (!processedCombinations.has(key)) {
                                dataLayananDistributor.push(dataParsingLayananDistributor);
                                processedCombinations.add(key);
                            }
                        }
                    } else {
                        if (dataParsingLayananDistributor.tarifId.jenis_jasa.nama !== 'Standar') {
                            const key = `${dataParsingLayananDistributor.tarifId._id}_${dataParsingLayananDistributor.jenisKendaraan._id}`;
                            if (!processedCombinations.has(key)) {
                                dataLayananDistributor.push(dataParsingLayananDistributor);
                                processedCombinations.add(key);
                            }
                        }
                    }

                }
            }

            let filteredDataKendaraan = dataLayananDistributor;
            // console.log(filteredDataKendaraan)

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

                    if (volumeProduct > ukuranVolumeMotor || beratProduct > ukuranVolumeMotor) {
                        if (kendaraan.jenisKendaraan.jenis === "Motor") {
                            data.push({
                                kendaraan,
                                jarakTempu: jarakTempu,
                                totalBeratProduct: beratProduct,
                                totalVolumeProduct: volumeProduct,
                                hargaOngkir: Math.round(hargaOngkir),
                                potongan_harga,
                                total_ongkir: Math.round(total_ongkir),
                                is_available: false
                            })
                        } else {
                            data.push({
                                kendaraan,
                                jarakTempu: jarakTempu,
                                totalBeratProduct: beratProduct,
                                totalVolumeProduct: volumeProduct,
                                hargaOngkir: Math.round(hargaOngkir),
                                potongan_harga,
                                total_ongkir: Math.round(total_ongkir),
                                is_available: true
                            })
                        }
                    }
                    else {
                        data.push({
                            kendaraan,
                            jarakTempu: jarakTempu,
                            totalBeratProduct: beratProduct,
                            totalVolumeProduct: volumeProduct,
                            hargaOngkir: Math.round(hargaOngkir),
                            potongan_harga,
                            total_ongkir: Math.round(total_ongkir),
                            is_available: true
                        })
                    }
                } else {
                    let potongan_harga;
                    let total_ongkir;
                    let hargaOngkir = 0
                    if (hargaTotalVolume > 1) {
                        const hargaVolume = hargaTotalVolume * dataBiayaTetap.biaya_per_kg
                        hargaOngkir = kendaraan.tarifId.tarif_dasar + hargaVolume
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

                    if (volumeProduct > ukuranVolumeMotor || beratProduct > ukuranVolumeMotor) {
                        if (kendaraan.jenisKendaraan.jenis === "Motor") {
                            data.push({
                                kendaraan,
                                jarakTempu: jarakTempu,
                                totalBeratProduct: beratProduct,
                                totalVolumeProduct: volumeProduct,
                                hargaOngkir: Math.round(hargaOngkir),
                                potongan_harga,
                                total_ongkir: Math.round(total_ongkir),
                                is_available: false
                            })
                        }
                        else {
                            data.push({
                                kendaraan,
                                jarakTempu: jarakTempu,
                                totalBeratProduct: beratProduct,
                                totalVolumeProduct: volumeProduct,
                                hargaOngkir: Math.round(hargaOngkir),
                                potongan_harga,
                                total_ongkir: Math.round(total_ongkir),
                                is_available: true
                            })
                        }
                    } else {
                        data.push({
                            kendaraan,
                            jarakTempu: jarakTempu,
                            totalBeratProduct: beratProduct,
                            totalVolumeProduct: volumeProduct,
                            hargaOngkir: Math.round(hargaOngkir),
                            potongan_harga,
                            total_ongkir: Math.round(total_ongkir),
                            is_available: true
                        })
                    }
                }
            }

            res.status(200).json({
                message: "get data success",
                data
                // dataLayanan
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
            const { id_distributor, nama, jenisKelamin, tanggalLahir, jenisKendaraan, merekKendaraan, nomorPolisi, warna, typeKendaraan, tarifId, tahun, no_telepon, jenis_sim } = req.body
            const files = req.files;
            const file_sim = files ? files.file_sim : null;
            const fotoKendaraan = files ? files.fotoKendaraan : null;
            const fileSTNK = files ? files.fileSTNK : null;
            const profile = files ? files.profile : null;

            if (!file_sim) return res.status(400).json({ message: "file Sim gagal di unggah" })
            if (!fotoKendaraan) return res.status(400).json({ message: "file Foto Kendaraan gagal di unggah" })
            if (!fileSTNK) return res.status(400).json({ message: "file STNK gagal di unggah" })

            const validateJenisKendaraan = await JenisKendaraan.findOne({ _id: jenisKendaraan })

            const dataKendaraan = await KendaraanDistributor.findOne({ id_distributor: id_distributor, jenisKendaraan: jenisKendaraan }).populate("jenisKendaraan")
            if (dataKendaraan) return res.status(400).json({ message: "kamu sudah memiliki kendaraaan", data: dataKendaraan })

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

            const regexNotelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNotelepon.test(no_telepon.toString())) return res.status(400).json({ message: "Nomor telepon tidak valid" });

            const dataCreateKendaraan = []
            const validateLayananKendaraan = await LayananKendaraanDistributor.findOne({ jenisKendaraan: jenisKendaraan, id_distributor: id_distributor }).populate("jenisKendaraan")

            const dataTarifidArray = tarifId.split('/');

            if (!validateLayananKendaraan) {
                for (let idTarif of dataTarifidArray) {
                    const validateTarifId = await Tarif.findOne({ _id: idTarif })
                    if (!validateTarifId) return res.status(404).json({ message: "Tarif ID Not Found" })
                    const createLayanaKendaraan = await LayananKendaraanDistributor.create({
                        id_distributor,
                        jenisKendaraan,
                        tarifId: idTarif,
                    })

                    dataCreateKendaraan.push(createLayanaKendaraan)
                }
            } else if (validateJenisKendaraan.jenis !== validateLayananKendaraan.jenisKendaraan.jenis) {
                for (let idTarif of dataTarifidArray) {

                    const validateTarifId = await Tarif.findOne({ _id: idTarif })
                    if (!validateTarifId) return res.status(404).json({ message: "Tarif ID Not FOund" })
                    const createLayanaKendaraan = await LayananKendaraanDistributor.create({
                        id_distributor,
                        jenisKendaraan,
                        tarifId: idTarif,
                    })

                    dataCreateKendaraan.push(createLayanaKendaraan)
                }
            }

            const dataPengemudi = await Pengemudi.create({
                id_distributor,
                nama,
                jenisKelamin,
                tanggalLahir,
                profile: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                file_sim: `${process.env.HOST}public/image-profile-distributtor/${imageName}`,
                no_telepon: no_telepon.toString(),
                jenis_sim
            })

            const data = await KendaraanDistributor.create({
                id_distributor,
                jenisKendaraan,
                merekKendaraan,
                nomorPolisi,
                warna,
                typeKendaraan,
                fotoKendaraan: `${process.env.HOST}public/image-profile-distributtor/${imageNameKendaraan}`,
                STNK: `${process.env.HOST}public/image-profile-distributtor/${imageNameSTNK}`,
                tahun
            })

            res.status(201).json({
                message: "create data success",
                dataKendaraan: data,
                dataLayanan: dataCreateKendaraan,
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
            const { id_distributor, jenisKendaraan, merekKendaraan, nomorPolisi, warna, typeKendaraan, tarifId, tahun } = req.body
            const files = req.files;
            const fotoKendaraan = files ? files.fotoKendaraan : null;
            const fileSTNK = files ? files.fileSTNK : null;

            const validateLayananKendaraan = await LayananKendaraanDistributor.findOne({ id_distributor: id_distributor, jenisKendaraan: jenisKendaraan }).populate("jenisKendaraan")
            const validateJenisKendaraan = await JenisKendaraan.findOne({ _id: jenisKendaraan })

            if (!fileSTNK || !fotoKendaraan) return res.status(400).json({ message: "unggah file gagal" })

            const imageNameSTNK = `${Date.now()}${path.extname(fileSTNK.name)}`;
            const imagePathSTNK = path.join(__dirname, '../../public/image-profile-distributtor', imageNameSTNK);

            await fileSTNK.mv(imagePathSTNK);

            const imageNameProfile = `${Date.now()}${path.extname(fotoKendaraan.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await fotoKendaraan.mv(imagePathProfile);

            const dataTarifidArray = tarifId.split('/')
            const dataCreateKendaraan = []

            if (!validateLayananKendaraan) {
                for (let idTarif of dataTarifidArray) {
                    const validateTarifId = await Tarif.findOne({ _id: idTarif })
                    if (!validateTarifId) return res.status(404).json({ message: "Tarif ID Not FOund" })
                    const createLayanaKendaraan = await LayananKendaraanDistributor.create({
                        id_distributor,
                        jenisKendaraan,
                        tarifId: idTarif,
                    })

                    dataCreateKendaraan.push(createLayanaKendaraan)
                }
            } else if (validateJenisKendaraan.jenis !== validateLayananKendaraan.jenisKendaraan.jenis) {
                for (let idTarif of dataTarifidArray) {
                    const validateTarifId = await Tarif.findOne({ _id: idTarif })
                    if (!validateTarifId) return res.status(404).json({ message: "Tarif ID Not FOund" })
                    const createLayanaKendaraan = await LayananKendaraanDistributor.create({
                        id_distributor,
                        jenisKendaraan,
                        tarifId: idTarif,
                    })

                    dataCreateKendaraan.push(createLayanaKendaraan)
                }
            }

            const data = await KendaraanDistributor.create({
                id_distributor,
                jenisKendaraan,
                merekKendaraan,
                nomorPolisi,
                warna,
                typeKendaraan,
                fotoKendaraan: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                STNK: `${process.env.HOST}public/image-profile-distributtor/${imageNameSTNK}`,
                tahun
            })

            res.status(201).json({
                message: "create data success",
                dataKendaraan: data,
                dataLayanan: dataCreateKendaraan
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
            const { warna, } = req.body
            const files = req.files;
            const fotoKendaraan = files ? files.fotoKendaraan : null;
            const fileSTNK = files ? files.fileSTNK : null;

            const imageNameSTNK = `${Date.now()}${path.extname(fileSTNK.name)}`;
            const imagePathSTNK = path.join(__dirname, '../../public/image-profile-distributtor', imageNameSTNK);

            await fileSTNK.mv(imagePathSTNK);

            const imageNameProfile = `${Date.now()}${path.extname(fotoKendaraan.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await fotoKendaraan.mv(imagePathProfile);

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, {
                warna,
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

    updateIndividuKendaraanPengemudi: async (req, res, next) => {
        try {
            const { warna, no_telepon, jenis_sim } = req.body
            const files = req.files;
            const fotoKendaraan = files ? files.fotoKendaraan : null;
            const fileSTNK = files ? files.fileSTNK : null;
            const file_sim = files ? files.file_sim : null;

            const imageName = `${Date.now()}${path.extname(file_sim.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-profile-distributtor', imageName);

            await file_sim.mv(imagePath);

            const imageNameSTNK = `${Date.now()}${path.extname(fileSTNK.name)}`;
            const imagePathSTNK = path.join(__dirname, '../../public/image-profile-distributtor', imageNameSTNK);

            await fileSTNK.mv(imagePathSTNK);

            const imageNameProfile = `${Date.now()}${path.extname(fotoKendaraan.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await fotoKendaraan.mv(imagePathProfile);

            const distributor = await Distributtor.findOne({ userId: req.user.id, _id: req.params.id })

            const data = await KendaraanDistributor.updateOne({ id_distributor: distributor._id }, {
                warna,
                fotoKendaraan: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                STNK: `${process.env.HOST}public/image-profile-distributtor/${imageNameSTNK}`,

            })

            await Pengemudi.updateOne({ id_distributor: distributor._id }, {
                no_telepon,
                jenis_sim,
                file_sim: `${process.env.HOST}/public/image-profile-distributtor${imageName}`
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

    veriifikasiKendaraan: async (req, res, next) => {
        try {
            const dataPengemudi = await KendaraanDistributor.findOne({ _id: req.params.id })
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            const data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { status: 'Aktif' }, { new: true })

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

    updateStatusKendaraan: async (req, res, next) => {
        try {
            const { status, descriptionStatusKendaraan } = req.body
            const dataPengemudi = await KendaraanDistributor.findOne({ _id: req.params.id })
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            let data
            if (status === 'Ditolak') {
                if (!descriptionStatusKendaraan) return res.status(400).json({ message: "descriptionStatusKendaraan harus di isi" })
                data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { descriptionStatusKendaraan, status: 'Ditolak' }, { new: true })
            } else if (status === 'Dinonaktifkan') {
                if (!descriptionStatusKendaraan) return res.status(400).json({ message: "descriptionStatusKendaraan harus di isi" })
                data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { descriptionStatusKendaraan, status: 'Dinonaktifkan' }, { new: true })
            } else if (status === 'Aktif') {
                data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { status: 'Aktif' }, { new: true })
            } else if (status === 'Diblokir') {
                if (!descriptionStatusKendaraan) return res.status(400).json({ message: "descriptionStatusKendaraan harus di isi" })
                data = await KendaraanDistributor.findByIdAndUpdate({ _id: req.params.id }, { descriptionStatusKendaraan, status: 'Diblokir' }, { new: true })
            }

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


    detailKendaraan: async (req, res, next) => {
        try {
            const kendaran = await KendaraanDistributor.findById(req.params.id).populate('id_distributor').populate('jenisKendaraan').populate('merekKendaraan')
            if (!kendaran) return res.status(404).json({ message: 'data Kendaraan Not Found' })

            res.status(200).json({
                message: 'get data detail kendaraan success',
                data: kendaran
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


    getAllpencarianKendaraDiProsesPengiriman: async (req, res, next) => {
        try {
            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: "distributor not found" })

            const penentuanWaktu = await ProsesPengirimanDistributor.findById(req.params.id).populate('pengirimanId')
            if (!penentuanWaktu) return res.status(404).json({ message: "proses pesanan not found" })

            const prosesPengiriman = await ProsesPengirimanDistributor.find({ distributorId: distributor._id }).populate('pengirimanId')
            if (prosesPengiriman.length === 0) return res.status(404).json({ message: "proses pesanan saat ini kosong" })

            const totalWaktu = penentuanWaktu.optimasi_pengiriman * 2

            const today = new Date(penentuanWaktu.waktu_pengiriman);
            const formattedDate = today.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const kendaraaan = await KendaraanDistributor.find({ id_distributor: distributor._id }).populate("id_distributor").populate("jenisKendaraan").populate("merekKendaraan")

            const datas = []

            for (let item of kendaraaan) {
                let tidakTersedia = false;

                for (let data of prosesPengiriman) {
                    const totalWaktuEstimasi = data.optimasi_pengiriman * 2;

                    const dateParameter = new Date(data.waktu_pengiriman);
                    const dateSaatIni = dateParameter.toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });

                    if (dateSaatIni === formattedDate && (totalWaktu === totalWaktuEstimasi || totalWaktu >= totalWaktuEstimasi) && item._id.equals(data.id_pengemudi)) {
                        tidakTersedia = true;
                        break; // Jika sudah ditemukan tidak tersedia, tidak perlu memeriksa lebih lanjut
                    }
                }

                datas.push({
                    ...item.toObject(),
                    tidak_tersedia: tidakTersedia
                });
            }

            res.status(200).json({
                message: "get data Kendaraan success",
                datas
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
