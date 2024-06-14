const PesananDistributor = require("../../models/distributor/model-pesananDistributor")
const Pesanan = require('../../models/model-orders')

module.exports = {
    getAllPesananDistributor: async (req, res, next) => {
        try {
            // const datas = await PesananDistributor.find()
            //     .populate("id_kendaraanDistributor")
            //     // .populate("id_pesanan")
            //     .populate("alamatKonsument")
            //     .populate("alamatTokoVendor")
            //     .populate({
            //         path: "konsumen",
            //         populate: {
            //             path: 'userId'
            //         }
            //     })
            //     .populate({
            //         path: "vendor",
            //         populate: {
            //             path: 'userId'
            //         }
            //     })
            const datas = await Pesanan.find()
            if (!datas) return res.status(404).json({ message: "saat ini data pesana distributor" })

            res.status(200).json({ message: "get data All success", datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getPesananDistributorById: async (req, res, next) => {
        try {
            const datas = await PesananDistributor.findOne({ _id: req.params.id })
            if (!datas) return res.status(404).json({ message: 'data Not Found' })

            res.status(200).json({ message: "get data by id succss", datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createPesananDistributor: async (req, res, next) => {
        try {
            const { id_kendaraanDistributor, id_pesanan, alamatKonsument, alamatTokoVendor, konsumen, vendor, jasaOngkir } = req.body

            const datas = await PesananDistributor.create({ id_kendaraanDistributor, id_pesanan, alamatKonsument, alamatTokoVendor, konsumen, vendor, jasaOngkir })

            res.status(201).json({ message: "create data success", datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updatePesananDistributor: async (req, res, next) => {
        try {
            const { id_kendaraanDistributor, id_pesanan, alamatKonsument, alamatTokoVendor, konsumen, vendor, jasaOngkir } = req.body

            const dataPesananDistributor = await PesananDistributor.findOne({ _id: req.params.id })
            if (!dataPesananDistributor) return res.status(404).json({ message: "data Not Found" })

            const datas = await PesananDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_kendaraanDistributor, id_pesanan, alamatKonsument, alamatTokoVendor, konsumen, vendor, jasaOngkir }, { new: true })
            if (!datas) return res.status(404).json({ message: "data Not Fond" })

            res.status(201).json({ message: "update Success", datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    deletePesananDistributor: async (req, res, next) => {
        try {
            const dataPesananDistributor = await PesananDistributor.findOne({ _id: req.params.id })
            if (!dataPesananDistributor) return res.status(404).json({ message: "data Not Found" })

            await PesananDistributor.deleteOne({ _id: req.params.id })

            res.status(200).json({ message: "delete success" })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}