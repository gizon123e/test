const Distributtor = require('../../models/distributor/model-distributor')
const TokoVendor = require('../../models/vendor/model-toko')
const Product = require('../../models/model-product')
const Konsumen = require('../../models/konsumen/model-konsumen')
const KendaraanDistributor = require('../../models/distributor/model-kendaraanDistributtor')
const Gratong = require('../../models/model-gratong')
const Address = require('../../models/model-address')
const BiayaTetap = require('../../models/model-biaya-tetap')
const User = require('../../models/model-auth-user')
const LayananKendaraanDistributor = require('../../models/distributor/layananKendaraanDistributor')
const Pengemudi = require('../../models/distributor/model-pengemudi')
const Toko = require('../../models/supplier/model-toko')
const { calculateDistance } = require('../../utils/menghitungJarak')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
const Pengiriman = require('../../models/model-pengiriman')
const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman')
const Vendor = require('../../models/vendor/model-vendor')
const Supplier = require('../../models/supplier/model-supplier')
const TokoSupplier = require('../../models/supplier/model-toko')
dotenv.config()

module.exports = {
    getProfileDistributor: async (req, res, next) => {
        try {
            const dataDistributor = await Distributtor.findOne({ userId: req.user.id }).populate("alamat_id").populate("userId")
            if (!dataDistributor) return res.status(404).json({ message: "data not found" })

            const pesanan = await Pengiriman.find({ distributorId: dataDistributor._id })
            const total_pesanan = pesanan.length
            const pesananBatal = pesanan.filter((item) => item.status_distributor === "Ditolak" || item.status_distributor === "Kadaluwarsa")
            const total_dibatalkan = pesananBatal.length

            const prosesPesanan = await ProsesPengirimanDistributor.find({ distributorId: dataDistributor._id })
            const pesananDikirim = prosesPesanan.filter((item) => item.status_distributor === "Selesai")
            const total_dijemput = pesananDikirim.length

            const today = new Date();
            const formattedDate = today.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            today.setDate(today.getDate() - 1);
            const formattedDateHariKemarin = today.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const dataPesananHariLalu = []
            const dataPesananSaatIni = []
            const dataMap = pesanan.map((data) => {
                const todayPesanan = new Date(data.createdAt);
                const formattedDatePesanan = todayPesanan.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });

                if (formattedDate === formattedDatePesanan) dataPesananSaatIni.push(data)

                if (formattedDateHariKemarin === formattedDatePesanan) dataPesananHariLalu.push(data)
            })

            const totalPesananHariIni = dataPesananSaatIni.length;
            const totalPesananHariLalu = dataPesananHariLalu.length;

            let kenaikanPersentase = 0;
            let penurunanPersentase = 0;
            let statusKenaikan = false

            if (totalPesananHariLalu > 0) {
                if (totalPesananHariIni >= totalPesananHariLalu) {
                    kenaikanPersentase = ((totalPesananHariIni - totalPesananHariLalu) / totalPesananHariLalu) * 100;
                    statusKenaikan = true
                } else {
                    penurunanPersentase = ((totalPesananHariLalu - totalPesananHariIni) / totalPesananHariLalu) * 100;
                    statusKenaikan = false
                }
            } else if (totalPesananHariIni > 0) {
                kenaikanPersentase = 100;
                statusKenaikan = true
            }

            let nilai_kenaikan = 0

            if (kenaikanPersentase >= penurunanPersentase) {
                nilai_kenaikan = kenaikanPersentase
            } else {
                nilai_kenaikan = penurunanPersentase
            }

            res.status(200).json({
                message: "data profile success",
                data: dataDistributor,
                total_pesanan,
                total_dibatalkan,
                total_dijemput,
                totalPesananHariIni,
                kenaikanPesanan: `${nilai_kenaikan.toFixed(2)}%`,
                statusKenaikan
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

    getDistributtorCariHargaTerenda: async (req, res, next) => {
        try {
            const { idAddress } = req.query
            const { product = [] } = req.body

            // const dataProduct = await Product.findOne({ _id: req.params.id }).populate('userId')
            const userDetail = await User.findById(req.params.id).select('role')

            let addressDetail;
            switch (userDetail.role) {
                case "vendor":
                    addressDetail = await TokoVendor.findOne({ userId: req.params.id }).populate("address");
                    break;
                case "supplier":
                    addressDetail = await TokoSupplier.findOne({ userId: req.params.id }).populate("address");
                    break;
            }

            const dataBiayaTetap = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" })

            let ukuranVolumeProduct = 0
            let ukuranBeratProduct = 0
            let hargaVolumeBeratProduct

            for (let productId of product) {
                const dataProduct = await Product.findOne({ _id: productId.id }).populate('userId')
                const volume = dataProduct.tinggi * dataProduct.lebar * dataProduct.panjang
                const volumeTotal = volume * productId.qty
                ukuranVolumeProduct += volumeTotal

                const berat = dataProduct.berat * productId.qty //gram
                const beratProduct = dataProduct.berat * dataProduct.minimalOrder
                // ukuranBeratProduct += berat
                if (berat) {
                    ukuranBeratProduct += berat
                } else {
                    ukuranBeratProduct += beratProduct
                }
            }

            const ukuranVolumeMotor = 100 * 30 * 40

            if (ukuranVolumeProduct <= ukuranVolumeMotor && ukuranBeratProduct > 30000) {
                const total = ukuranBeratProduct / 1000
                hargaVolumeBeratProduct = total
            } else if (ukuranVolumeProduct <= ukuranVolumeMotor && ukuranBeratProduct <= 30000) {
                const total = ukuranBeratProduct / 1000
                hargaVolumeBeratProduct = total
            } else if (ukuranVolumeProduct > ukuranVolumeMotor && ukuranBeratProduct > 30000) {
                const beratVolume = ukuranVolumeProduct / dataBiayaTetap.constanta_volume
                const beratAktual = ukuranBeratProduct / 1000
                if (beratVolume > beratAktual) {
                    hargaVolumeBeratProduct = beratVolume
                } else {
                    hargaVolumeBeratProduct = beratAktual
                }
            } else {
                const total = ukuranVolumeProduct / dataBiayaTetap.constanta_volume
                hargaVolumeBeratProduct = total
            }

            const latDetail = parseFloat(addressDetail.address.pinAlamat.lat)
            const longDetail = parseFloat(addressDetail.address.pinAlamat.long)

            const addressCustom = await Address.findById(idAddress)
            const latitudeAddressCustom = parseFloat(addressCustom.pinAlamat.lat)
            const longitudeAddressCustom = parseFloat(addressCustom.pinAlamat.long)
            const ongkir = calculateDistance(latitudeAddressCustom, longitudeAddressCustom, latDetail, longDetail, 100);

            if (isNaN(ongkir)) {
                return res.status(400).json({
                    message: "Jarak antara konsumen dan vendor melebihi 100 km"
                });
            }

            let dataAllDistributtor = []
            const dataDistributtor = await Distributtor.find().populate("userId", '-password').populate('alamat_id')

            if (!dataDistributtor) return res.status(400).json({ message: "kamu belom ngisi data yang lengkap" })

            for (let distributor of dataDistributtor) {
                const latitudeDistributtot = parseFloat(distributor.alamat_id.pinAlamat.lat)
                const longitudeDistributtor = parseFloat(distributor.alamat_id.pinAlamat.long)

                const distance = calculateDistance(latitudeDistributtot, longitudeDistributtor, latDetail, longDetail, 50);

                if (Math.round(distance) < 50 && distance !== NaN) {

                    const dataKendaraan = await LayananKendaraanDistributor.find({ id_distributor: distributor._id })
                        .populate({
                            path: "id_distributor",
                            populate: "userId"
                        })
                        .populate("jenisKendaraan")
                        .populate({
                            path: "tarifId",
                            populate: "jenis_kendaraan",
                            populate: "jenis_jasa"
                        })

                    if (dataKendaraan.length > 0)
                        for (let data of dataKendaraan) {
                            const gratong = await Gratong.findOne({ tarif: data.tarifId._id, startTime: { $lt: new Date() }, endTime: { $gt: new Date() } });

                            const jarakOngkir = Math.round(ongkir)
                            if (jarakOngkir > 4) {
                                let potongan_harga;
                                let total_ongkir;

                                const angkaJarak = jarakOngkir - 4
                                const hargaKiloMeter = angkaJarak * data.tarifId.tarif_per_km
                                let hargaOngkir = 0

                                if (hargaVolumeBeratProduct > 1) {
                                    const hargaVolume = hargaVolumeBeratProduct * dataBiayaTetap.biaya_per_kg
                                    hargaOngkir = (hargaKiloMeter + data.tarifId.tarif_dasar) + hargaVolume
                                } else {
                                    hargaOngkir = (hargaKiloMeter + data.tarifId.tarif_dasar) + dataBiayaTetap.biaya_per_kg
                                }

                                if (gratong) {
                                    data.isGratong = true
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
                                    data.isGratong = false
                                    total_ongkir = hargaOngkir
                                }

                                dataAllDistributtor.push({
                                    distributor: data,
                                    ukuranBeratProduct,
                                    ukuranVolumeProduct,
                                    hargaOngkir,
                                    jarakTempu: Math.round(distance),
                                    potongan_harga,
                                    total_ongkir: Math.round(total_ongkir)
                                })
                            } else {
                                let potongan_harga;
                                let total_ongkir;
                                let hargaOngkir = 0

                                if (hargaVolumeBeratProduct > 1) {
                                    const hargaVolume = hargaVolumeBeratProduct * dataBiayaTetap.biaya_per_kg
                                    hargaOngkir = data.tarifId.tarif_dasar + hargaVolume
                                } else {
                                    hargaOngkir = data.tarifId.tarif_dasar + dataBiayaTetap.biaya_per_kg
                                }

                                if (gratong) {
                                    data.isGratong = true
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
                                    data.isGratong = false
                                    total_ongkir = hargaOngkir
                                }

                                dataAllDistributtor.push({
                                    distributor: data,
                                    jarakTempu: Math.round(distance),
                                    ukuranBeratProduct,
                                    ukuranVolumeProduct,
                                    hargaOngkir: Math.round(hargaOngkir),
                                    total_ongkir: Math.round(total_ongkir),
                                    potongan_harga
                                })
                            }
                        }
                }
            }

            const validate = dataAllDistributtor.filter(data =>
                data.distributor.id_distributor.userId.isDetailVerified && data.distributor.id_distributor.userId.isVerifikasiDocument);

            let validDistributors = []
            for (let distributor of validate) {
                const activeKendaraan = await KendaraanDistributor.find({ id_distributor: distributor.distributor.id_distributor._id, status: 'Aktif' })
                const activePengemudi = await Pengemudi.find({ id_distributor: distributor.distributor.id_distributor._id, status: 'Aktif' })

                if (activeKendaraan.length > 0 && activePengemudi.length > 0) {
                    validDistributors.push(distributor)
                }
            }
            let dataKendaraanHargaTermurah

            if (validate.length > 0) {
                if (ukuranVolumeProduct > ukuranVolumeMotor || ukuranBeratProduct > 30000) {
                    dataKendaraanHargaTermurah = validDistributors
                        .filter((item) => item.distributor.jenisKendaraan.jenis !== 'Motor' && item.distributor.id_distributor.tolak_pesanan < 4)
                        .sort((a, b) => a.total_ongkir - b.total_ongkir);
                } else {
                    dataKendaraanHargaTermurah = validDistributors
                        .filter(item => item.distributor.id_distributor.tolak_pesanan < 4)
                        .sort((a, b) => a.total_ongkir - b.total_ongkir);
                }
            }

            const datas = dataKendaraanHargaTermurah[0]

            res.status(200).json({
                message: "success get data Distributtor",
                datas: datas ? datas : {}
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
            const { product = [] } = req.body

            const ukuranVolumeMotor = 100 * 30 * 40
            let totalUkuranVolumeProduct = 0
            let totalUkuranBeratProduct = 0

            for (let productId of product) {
                const dataProduct = await Product.findOne({ _id: productId.id }).populate('userId')
                const ukuranVolumeProduct = dataProduct.tinggi * dataProduct.lebar * dataProduct.panjang;
                const ukuranBeratProduct = dataProduct.berat * productId.qty;
                totalUkuranVolumeProduct += ukuranVolumeProduct;
                totalUkuranBeratProduct += ukuranBeratProduct;
            }
            const userData = await User.findOne({ _id: req.params.id })

            let addressVendor
            if (userData.role === 'vendor') {
                const tokoVendor = await TokoVendor.findOne({ userId: req.params.id }).populate('address')
                addressVendor = tokoVendor
            } else if (userData.role === 'supplier') {
                const tokoSupplier = await Toko.findOne({ userId: req.params.id }).populate('address')
                addressVendor = tokoSupplier
            }

            const latitudeVendor = parseFloat(addressVendor.address.pinAlamat.lat).toFixed(7)
            const longitudeVendor = parseFloat(addressVendor.address.pinAlamat.long).toFixed(7)

            let detailUser;
            switch (req.user.role) {
                case "konsumen":
                    detailUser = await Konsumen.findOne({ userId: req.user.id }).populate("address");
                    break;
                case "vendor":
                    detailUser = await Vendor.findOne({ userId: req.user.id }).populate("address");
                    break;
                case "supplier":
                    detailUser = await Supplier.findOne({ userId: req.user.id }).populate("address");
                    break;
            }
            const latDetail = parseFloat(detailUser.address.pinAlamat.lat)
            const longDetail = parseFloat(detailUser.address.pinAlamat.long)

            if (addressId) {
                const addressCustom = await Address.findById(addressId)
                const latitudeAddressCustom = parseFloat(addressCustom.pinAlamat.lat).toFixed(7)
                const longitudeAddressCustom = parseFloat(addressCustom.pinAlamat.long).toFixed(7)

                const jarakVendorKonsumen = calculateDistance(parseFloat(latitudeAddressCustom), parseFloat(longitudeAddressCustom), parseFloat(latitudeVendor), parseFloat(longitudeVendor), 100);

                if (isNaN(jarakVendorKonsumen)) {
                    return res.status(400).json({
                        message: "Jarak antara konsumen dan vendor melebihi 100 km"
                    });
                }
            } else {
                const jarakVendorKonsumen = calculateDistance(parseFloat(latDetail), parseFloat(longDetail), parseFloat(latitudeVendor), parseFloat(longitudeVendor), 100);
                console.log("address konsumen", jarakVendorKonsumen)
                if (isNaN(jarakVendorKonsumen)) {
                    return res.status(400).json({
                        message: "Jarak antara konsumen dan vendor melebihi 100 km"
                    });
                }
            }

            let query = {

            }
            if (name) {
                query.nama_distributor = { $regex: name, $options: 'i' }
            }

            let datas = []
            const dataDistributtor = await Distributtor.find(query).populate("userId", '-password').populate('alamat_id')
            if (!dataDistributtor) return res.status(400).json({ message: "kamu belom ngisi data yang lengkap" })

            for (let distributor of dataDistributtor) {
                const latitudeDistributtot = parseFloat(distributor.alamat_id.pinAlamat.lat)
                const longitudeDistributtor = parseFloat(distributor.alamat_id.pinAlamat.long)

                const distance = calculateDistance(latitudeDistributtot, longitudeDistributtor, latitudeVendor, longitudeVendor, 50);

                if (Math.round(distance) < 50 && distance !== NaN) {
                    const dataKendaraan = await KendaraanDistributor.find({ id_distributor: distributor._id, status: 'Aktif' })
                        .populate({
                            path: "id_distributor",
                            populate: "alamat_id"
                        })
                        .populate("jenisKendaraan")
                        .lean()

                    const dataPengemudi = await Pengemudi.find({ id_distributor: distributor._id, status: 'Aktif' })

                    let filteredDataKendaraan = dataKendaraan
                    if (totalUkuranVolumeProduct > ukuranVolumeMotor || totalUkuranBeratProduct > ukuranVolumeMotor) {
                        filteredDataKendaraan = dataKendaraan.filter(kendaraan => kendaraan.jenisKendaraan.jenis !== 'Motor');
                    } else {
                        filteredDataKendaraan = dataKendaraan
                    }

                    if (filteredDataKendaraan.length > 0 && dataPengemudi.length > 0) {
                        datas.push({
                            distributor,
                            jarakTempu: Math.round(distance)
                        })
                    }
                }
            }

            if (datas.length === 0) {
                return res.status(400).json({ message: "distributor belom tersedia" })
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

    getAllDistributtorBeckupBisaOrderVendorLebiDariSatu: async (req, res, next) => {
        try {
            const { name, addressId } = req.query
            const { product = [], id_toko = [] } = req.body

            const ukuranVolumeMotor = 100 * 30 * 40
            let totalUkuranVolumeProduct = 0
            let totalUkuranBeratProduct = 0

            for (let productId of product) {
                const dataProduct = await Product.findOne({ _id: productId.id }).populate('userId')
                const ukuranVolumeProduct = dataProduct.tinggi * dataProduct.lebar * dataProduct.panjang;
                const ukuranBeratProduct = dataProduct.berat * productId.qty;
                totalUkuranVolumeProduct += ukuranVolumeProduct;
                totalUkuranBeratProduct += ukuranBeratProduct;
            }

            if (id_toko.length === 2) {
                const toko1 = await TokoVendor.findOne({ _id: id_toko[0] }).populate('address');
                const toko2 = await TokoVendor.findOne({ _id: id_toko[1] }).populate('address');

                const latitudeToko1 = parseFloat(toko1.address.pinAlamat.lat)
                const longitudeToko1 = parseFloat(toko1.address.pinAlamat.long)
                const latitudeToko2 = parseFloat(toko2.address.pinAlamat.lat)
                const longitudeToko2 = parseFloat(toko2.address.pinAlamat.long)

                const jarak = calculateDistance(latitudeToko1, longitudeToko1, latitudeToko2, longitudeToko2, 200);
                if (isNaN(jarak)) {
                    return res.status(400).json({
                        message: "Jarak antara toko 1 dan toko 2 melebihi 5 km"
                    });
                }
            }

            const tokoVendor = []
            if (addressId) {
                const addressCustom = await Address.findById(addressId)
                if (!addressCustom) return res.status(404).json({ essage: 'addressId dat Not Found' })

                for (let data of id_toko) {
                    const toko = await TokoVendor.findOne({ _id: data }).populate('address');

                    const latitudeToko = parseFloat(toko.address.pinAlamat.lat)
                    const longitudeToko = parseFloat(toko.address.pinAlamat.long)

                    const jarak = calculateDistance(parseFloat(addressCustom.pinAlamat.lat), parseFloat(addressCustom.pinAlamat.long), latitudeToko, longitudeToko, 100);
                    if (Math.round(jarak) < 100 && jarak !== NaN) {
                        tokoVendor.push(toko)
                    }
                }
            }

            let query = {}
            if (name) {
                query.nama_distributor = { $regex: name, $options: 'i' }
            }

            let datas = []
            const dataDistributtor = await Distributtor.find(query).populate("userId", '-password').populate('alamat_id')
            for (let distributor of dataDistributtor) {
                const latitudeDistributtot = parseFloat(distributor.alamat_id.pinAlamat.lat)
                const longitudeDistributtor = parseFloat(distributor.alamat_id.pinAlamat.long)

                for (let itemToko of tokoVendor) {
                    const distance = calculateDistance(latitudeDistributtot, longitudeDistributtor, parseFloat(itemToko.address.pinAlamat.lat), parseFloat(itemToko.address.pinAlamat.long), 50);

                    if (Math.round(distance) < 50 && distance !== NaN) {
                        const dataKendaraan = await KendaraanDistributor.find({ id_distributor: distributor._id, status: 'Aktif' })
                            .populate({
                                path: "id_distributor",
                                populate: "alamat_id"
                            })
                            .populate("jenisKendaraan")
                            .lean()

                        const dataPengemudi = await Pengemudi.find({ id_distributor: distributor._id, status: 'Aktif' })

                        let filteredDataKendaraan = dataKendaraan
                        if (totalUkuranVolumeProduct > ukuranVolumeMotor || totalUkuranBeratProduct > ukuranVolumeMotor) {
                            filteredDataKendaraan = dataKendaraan.filter(kendaraan => kendaraan.jenisKendaraan.jenis !== 'Motor');
                        } else {
                            filteredDataKendaraan = dataKendaraan
                        }

                        if (filteredDataKendaraan.length > 0 && dataPengemudi.length > 0) {
                            datas.push({
                                distributor,
                                jarakTempu: Math.round(distance)
                            })
                        }
                    }

                }
            }

            res.status(200).json({
                message: 'get data all distributor success',
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

    getAllPencarianUlangDistributor: async (req, res, next) => {
        try {
            const { name, addressId } = req.query
            const { product = [], id_distributor } = req.body

            const ukuranVolumeMotor = 100 * 30 * 40
            let totalUkuranVolumeProduct = 0
            let totalUkuranBeratProduct = 0

            for (let productId of product) {
                const dataProduct = await Product.findOne({ _id: productId.id }).populate('userId')
                const ukuranVolumeProduct = dataProduct.tinggi * dataProduct.lebar * dataProduct.panjang;
                const ukuranBeratProduct = dataProduct.berat * productId.qty;
                totalUkuranVolumeProduct += ukuranVolumeProduct;
                totalUkuranBeratProduct += ukuranBeratProduct;
            }

            const addressVendor = await TokoVendor.findOne({ userId: req.params.id }).populate('address')

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

            let query = {

            }
            if (name) {
                query.nama_distributor = { $regex: name, $options: 'i' }
            }

            let datas = []
            const dataDistributtor = await Distributtor.find(query).populate("userId", '-password').populate('alamat_id')
            if (!dataDistributtor) return res.status(400).json({ message: "kamu belom ngisi data yang lengkap" })

            for (let distributor of dataDistributtor) {
                const latitudeDistributtot = parseFloat(distributor.alamat_id.pinAlamat.lat)
                const longitudeDistributtor = parseFloat(distributor.alamat_id.pinAlamat.long)

                const distance = calculateDistance(latitudeDistributtot, longitudeDistributtor, latitudeVendor, longitudeVendor, 50);

                if (Math.round(distance) < 50 && distance !== NaN) {
                    const dataKendaraan = await KendaraanDistributor.find({ id_distributor: distributor._id, status: 'Aktif' })
                        .populate({
                            path: "id_distributor",
                            populate: "alamat_id"
                        })
                        .populate("jenisKendaraan")
                        .lean()

                    const dataPengemudi = await Pengemudi.find({ id_distributor: distributor._id, status: 'Aktif' })

                    let filteredDataKendaraan = dataKendaraan
                    if (totalUkuranVolumeProduct > ukuranVolumeMotor || totalUkuranBeratProduct > ukuranVolumeMotor) {
                        filteredDataKendaraan = dataKendaraan.filter(kendaraan => kendaraan.jenisKendaraan.jenis !== 'Motor');
                    } else {
                        filteredDataKendaraan = dataKendaraan
                    }

                    if (filteredDataKendaraan.length > 0 && dataPengemudi.length > 0) {
                        datas.push({
                            distributor,
                            jarakTempu: Math.round(distance)
                        })
                    }
                }
            }

            if (datas.length === 0) {
                return res.status(400).json({ message: "distributor belom tersedia" })
            }

            const dataPayload = datas.filter(item => item.distributor._id.toString() !== id_distributor);

            res.status(200).json({
                message: "success get data Distributtor",
                datas: dataPayload
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
            const { nama_distributor, province, regency, district, village, code_pos, address_description, long_pin_alamat, lat_pin_alamat, userId, npwp, nik, nomorAkta, noTelepon } = req.body

            const validateDistributor = await Distributtor.findOne({ userId })
            if (validateDistributor) return res.status(400).json({ message: "User ini sudah memiliki data detail Distributor", data: validateDistributor });
            const address = {
                province,
                regency,
                district,
                village,
                code_pos,
                address_description,
                pinAlamat: {
                    long: long_pin_alamat,
                    lat: lat_pin_alamat
                },
                isMain: true
            };

            const newAddress = await Address.create({ ...address, userId });

            const files = req.files;
            const npwp_file = files ? files.file_npwp : null;
            const file_ktp = files ? files.file_ktp : null;
            const fileNib = files ? files.fileNib : null;

            if (!npwp_file) {
                return res.status(400).json({ message: "kamu gagal masukan file npwp" });
            }

            const imageName = `${Date.now()}${path.extname(npwp_file.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-npwp', imageName);

            await npwp_file.mv(imagePath);

            if (nik) {
                if (!file_ktp) {
                    return res.status(400).json({ message: "kamu gagal masukan file ktp" });
                }

                const imageNameKtp = `${Date.now()}${path.extname(file_ktp.name)}`;
                const imagePathKtp = path.join(__dirname, '../../public/image-ktp', imageNameKtp);

                await file_ktp.mv(imagePathKtp);

                const data = await Distributtor.create({
                    nama_distributor,
                    npwp,
                    userId,
                    alamat_id: newAddress._id,
                    file_npwp: `${process.env.HOST}public/image-npwp/${imageName}`,
                    individu: {
                        nik: nik,
                        file_ktp: `${process.env.HOST}public/image-ktp/${imageNameKtp}`,
                    }
                })

                return res.status(201).json({
                    message: "create data individue success",
                    data
                })
            }

            if (!fileNib) {
                return res.status(400).json({ message: "kamu gagal masukan file Nib" });
            }

            const imageNameNib = `${Date.now()}${path.extname(fileNib.name)}`;
            const imagePathNib = path.join(__dirname, '../../public/image-nib', imageNameNib);

            await fileNib.mv(imagePathNib);

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(noTelepon.toString())) return res.status(400).json({ message: "no telepon tidak valid" })

            if (!nomorAkta || !noTelepon) return res.status(400).json({ message: "data Perusahaan belom lengkap" })

            const data = await Distributtor.create({
                nama_distributor,
                userId,
                alamat_id: newAddress._id,
                file_npwp: `${process.env.HOST}public/image-npwp/${imageName}`,
                npwp,
                perusahaan: {
                    nomorAkta: nomorAkta,
                    noTelepon: parseInt(noTelepon),
                    fileNib: `${process.env.HOST}public/image-nib/${imageNameNib}`
                }
            })

            return res.status(201).json({
                message: "create data perusahaan success",
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
            const { nama_distributor, alamat_id, userId, npwp, nik, nomorAkta, noTelepon, alamatGudang, tanggalLahir, jenisKelamin, jenisPerusahaan } = req.body
            const files = req.files;
            const npwp_file = files ? files.file_npwp : null;
            const file_ktp = files ? files.file_ktp : null;
            const fileNib = files ? files.fileNib : null;
            const imageProfile = files ? files.imageProfile : null

            if (tanggalLahir && jenisKelamin || tanggalLahir && jenisPerusahaan) {
                if (!imageProfile) {
                    return res.status(400).json({ message: "kamu gagal masukan file imageProfile" });
                }

                await User.updateOne({ _id: req.user.id }, { isActive: true })

                const imageNameProfile = `${Date.now()}${path.extname(imageProfile.name)}`;
                const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

                await imageProfile.mv(imagePathProfile);

                const data = await Distributtor.findOneAndUpdate({ userId: req.user.id }, {
                    tanggal_lahir: tanggalLahir,
                    jenisKelamin,
                    jenisPerusahaan,
                    imageProfile: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`
                }, { new: true });

                return res.status(201).json({
                    message: "update data success",
                    data
                })
            }

            if (!npwp_file) {
                return res.status(400).json({ message: "kamu gagal masukan file npwp" });
            }

            const imageName = `${Date.now()}${path.extname(npwp_file.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-npwp', imageName);

            await npwp_file.mv(imagePath);

            if (nik && file_ktp) {
                if (!file_ktp) {
                    return res.status(400).json({ message: "kamu gagal masukan file ktp" });
                }

                const imageNameKtp = `${Date.now()}${path.extname(file_ktp.name)}`;
                const imagePathKtp = path.join(__dirname, '../../public/image-ktp', imageNameKtp);

                await file_ktp.mv(imagePathKtp);

                const data = await Distributtor.findByIdAndUpdate({ userId: req.user.id }, {
                    nama_distributor,
                    npwp,
                    userId,
                    alamat_id,
                    file_npwp: `${process.env.HOST}public/image-npwp/${imageName}`,
                    individu: {
                        nik: nik,
                        file_ktp: `${process.env.HOST}public/image-ktp/${imageNameKtp}`,
                    }
                }, { new: true })

                return res.status(201).json({
                    message: "update data individue success",
                    data
                })
            }

            if (!fileNib) {
                return res.status(400).json({ message: "kamu gagal masukan file Nib" });
            }

            const imageNameNib = `${Date.now()}${path.extname(fileNib.name)}`;
            const imagePathNib = path.join(__dirname, '../../public/image-nib', imageNameNib);

            await fileNib.mv(imagePathNib);

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(noTelepon.toString())) return res.status(400).json({ message: "no telepon tidak valid" })

            if (!nomorAkta || !noTelepon) return res.status(400).json({ message: "data Perusahaan belom lengkap" })

            const data = await Distributtor.findByIdAndUpdate({ userId: req.user.id }, {
                nama_distributor,
                userId,
                alamat_id,
                file_npwp: `${process.env.HOST}public/image-npwp/${imageName}`,
                npwp,
                perusahaan: {
                    nomorAkta: nomorAkta,
                    noTelepon: parseInt(noTelepon),
                    alamatGudang: alamatGudang,
                    fileNib: `${process.env.HOST}public/image-nib/${imageNameNib}`
                }
            }, { new: true })

            return res.status(201).json({
                message: "update data perusahaan success",
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