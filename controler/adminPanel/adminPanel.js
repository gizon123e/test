const bcrypt = require('bcrypt')
const jwt = require('../../utils/jwt')
const User_System = require('../../models/model-user-system')
const VirtualAccountUser = require('../../models/model-user-va')
const User = require('../../models/model-auth-user')
const Konsumen = require('../../models/konsumen/model-konsumen')
const Vendor = require('../../models/vendor/model-vendor')
const ModelPenanggungJawabVendor = require("../../models/vendor/model-penanggung-jawab")
const Distributtor = require('../../models/distributor/model-distributor')
const Supplier = require("../../models/supplier/model-supplier")
const Produsen = require('../../models/produsen/model-produsen')
const DokumenPenanggungJawab = require("../../models/distributor/model-documenPenanggungJawab")
const ModelPenanggungJawabKonsumen = require('../../models/konsumen/model-penanggung-jawab')
const BiayaTetap = require("../../models/model-biaya-tetap")
const Invoice = require('../../models/model-invoice')
const { Transaksi } = require("../../models/model-transaksi")
const Pengiriman = require("../../models/model-pengiriman")
const Pembatalan = require("../../models/model-pembatalan")
const Pesanan = require("../../models/model-orders")
const Product = require('../../models/model-product')

module.exports = {
    register: async (req, res, next) => {
        try {
            const { email, role, password } = req.body

            const user = await User_System.findOne({ email })
            console.log(user)
            if (user) return res.status(400).json({ message: `name ${email} sudah register` })

            const dataPassword = await bcrypt.hash(password, 10)

            const data = await User_System.create({ email, role, password: dataPassword })

            res.status(201).json({
                message: 'Register Success',
                data
            })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body

            const user = await User_System.findOne({ email })
            if (!user) return res.status(400).json({ message: `name ${email} belom register` })

            const validatePassword = await bcrypt.compare(password, user.password)
            if (!validatePassword) return res.status(400).json({ message: "Username / Password incored" })

            const tokenPayload = {
                id: user._id,
                email: user.email,
                password: user.password,
                role: user.role,
            };

            const token = jwt.createToken(tokenPayload)

            res.status(201).json({
                message: "Login Success",
                data: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    token
                }
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    userDetailId: async (req, res, next) => {
        try {
            const dataDetailId = await VirtualAccountUser.findOne({ userId: req.params.id }).populate("userId").populate("nama_bank")
            if (!dataDetailId) {
                return res.status(404).json({ message: "data Not Found" })
            }

            res.status(200).json({
                message: "get detail success",
                datas: dataDetailId
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getDataDetailUser: async (req, res, next) => {
        try {
            const dataUser = await User.findById(req.params.id)
            if (!dataUser) return res.status(404).json({ message: "data User Not Found" })

            let dataPayload
            if (dataUser.role === "konsumen") {
                const data = await Konsumen.findOne({ userId: req.params.id }).populate("userId").populate("address")
                const dataDocument = await ModelPenanggungJawabKonsumen.findOne({ userId: req.params.id }).populate("alamat").populate("detailId")

                dataPayload = {
                    dataKonsument: data,
                    dataDocument,
                    role: dataUser.role
                }

            }

            if (dataUser.role === "vendor") {
                const dataVendor = await Vendor.findOne({ userId: req.params.id }).populate("address")
                const dataDocument = await ModelPenanggungJawabVendor.findOne({ userId: req.params.id }).populate({
                    path: "detailId",
                    populate: "address"
                })

                dataPayload = {
                    dataVendor,
                    dataDocument,
                    role: dataUser.role
                }
            }

            if (dataUser.role === "distributor") {
                const data = await Distributtor.findOne({ userId: req.params.id }).populate("userId").populate("alamat_id")
                if (!data) return res.status(404).json({ message: "data Distributor Not Found" })

                let dataDocumentPenanggungJawab = null
                if (!data.individu) {
                    dataDocumentPenanggungJawab = await DokumenPenanggungJawab.findOne({ id_distributor: data._id }).populate("address")
                }

                dataPayload = {
                    dataDistributor: data,
                    dataDocument: dataDocumentPenanggungJawab,
                    role: dataUser.role
                }
            }

            if (dataUser.role === 'supplier') {
                dataPayload = await Supplier.findOne({ userId: req.params.id }).populate("userId").populate("address")
                if (!dataPayload) return res.status(404).json({ message: "data Suplier Not Found" })
            }

            if (dataUser.role === "produsen") {
                dataPayload = await Produsen.findOne({ userId: req.params.id }).populate("userId").populate("address")
                if (!dataPayload) return res.status(404).json({ message: "data Produsen Not Found" })
            }

            res.status(200).json({
                message: "data Detail success",
                datas: dataPayload
            })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    tolakVerivikasiDocument: async (req, res, next) => {
        try {
            const { pesanPenolakan } = req.body

            const dataUser = await User.findByIdAndUpdate({ _id: req.params.id }, { pesanPenolakan, isVerifikasiDocument: false }, { new: true })

            if (!dataUser) return res.status(404).json({ message: "data Not Found" })

            res.status(201).json({ message: "data update success", datas: dataUser })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getBiayaTetap: async (req, res, next) => {
        try {
            const data = await BiayaTetap.find()

            res.status(200).json({ message: "data update success", data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    updateBiayaTetap: async (req, res, next) => {
        try {
            const { biaya_proteksi, biaya_asuransi, biaya_layanan, biaya_jasa_aplikasi, nilai_koin, biaya_per_kg, constanta_volume, lama_pengemasan, rerata_kecepatan } = req.body

            const dataBiayatetap = await BiayaTetap.findOne({ _id: req.params.id })
            if (!dataBiayatetap) return res.status(404).json({ message: "data Not Found" })

            const data = await BiayaTetap.updateOne({ _id: req.params.id }, { biaya_proteksi, biaya_asuransi, biaya_layanan, biaya_jasa_aplikasi, nilai_koin, biaya_per_kg, constanta_volume, lama_pengemasan, rerata_kecepatan })

            res.status(201).json({ message: "update success", data })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    findByIdBiayaTetap: async (req, res, next) => {
        try {
            const data = await BiayaTetap.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            res.status(201).json({ message: "get by id success", data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllPesananKonsument: async (req, res, next) => {
        try {
            const data = await Pesanan.find().populate("userId")

            if (!data) return res.status(400).json({ message: "data saat ini masi kosong" })
            const dataPayload = []

            for (const pesanan of data) {
                // Menggunakan populate untuk mengisi data productId dalam items
                await pesanan.populate({
                    path: 'items.product.productId',
                    model: 'Product' // Nama model Product Anda
                })

                // Menemukan konsumen berdasarkan userId dari pesanan
                const konsumen = await Konsumen.findOne({ userId: pesanan.userId._id })

                // Menyiapkan dataPayload dengan informasi produk yang telah dipopulasi
                const itemsWithPopulatedProducts = await Promise.all(
                    pesanan.items.map(async (item) => {
                        const productsWithRoleAndInfo = await Promise.all(
                            item.product.map(async (prod) => {
                                const product = prod.productId
                                let vendorOrSupplierInfo = null

                                // Mencari role dan informasi berdasarkan userId dari produk
                                if (product && product.userId) {
                                    const vendor = await Vendor.findOne({ userId: product.userId }).populate("userId")
                                    const supplier = await Supplier.findOne({ userId: product.userId }).populate("userId")

                                    if (vendor) {
                                        vendorOrSupplierInfo = vendor
                                    } else if (supplier) {
                                        vendorOrSupplierInfo = supplier
                                    }
                                }

                                return {
                                    ...prod._doc,
                                    productId: product,
                                    vendorOrSupplierInfo
                                }
                            })
                        )

                        return {
                            ...item._doc,
                            product: productsWithRoleAndInfo
                        }
                    })
                )

                dataPayload.push({
                    ...pesanan._doc,
                    items: itemsWithPopulatedProducts,
                    konsumen: konsumen // Menambahkan data konsumen jika diperlukan
                })
            }

            res.status(200).json({
                message: "data get all success",
                // leng: dataPayload.length,
                data: dataPayload
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllPengiriman: async (req, res, next) => {
        try {
            const data = await Pengiriman.find()
                .populate("distributorId")
                .populate({
                    path: "productToDelivers.productId",
                    model: "Product"
                })
                .populate("id_jenis_kendaraan")
                .populate({
                    path: "orderId",
                    populate: "userId"
                })

            if (!data) return res.status(400).json({ message: "data saat ini masi kosong" })


            res.status(200).json({
                message: "data get all success",
                data
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllPembatalan: async (req, res, next) => {
        try {
            const data = await Pembatalan.find().populate("pesananId")
            if (!data) return res.status(400).json({ message: "saat ini data masi kosong" })

            res.status(200).json({
                message: "get data all distributor succcess",
                data
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}