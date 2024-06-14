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
                }).populate("alamat")

                dataPayload = {
                    dataVendor,
                    dataDocument,
                    role: dataUser.role
                }
            }

            if (dataUser.role === "distributor") {
                const data = await Distributtor.findOne({ userId: req.params.id }).populate("userId").populate("alamat_id")
                if (!data) return res.status(404).json({ message: "data Distributor Not Found" })

                const dataDocumentPenanggungJawab = await DokumenPenanggungJawab.findOne({ id_distributor: data._id }).populate("address")

                if (!dataDocument || !dataDocumentPenanggungJawab) return res.status(404).json({ message: "data Not Found" })

                dataPayload = {
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
    }
}