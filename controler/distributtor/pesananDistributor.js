const PesananDistributor = require("../../models/distributor/model-pesananDistributor")
const Pesanan = require('../../models/model-orders')
const Pengiriman = require("../../models/model-pengiriman")

module.exports = {
    getAllPesananDistributor: async (req, res, next) => {
        try {
            const datas = await Pesanan.find()
            if (!datas) return res.status(404).json({ message: "saat ini data pesana distributor" })

            res.status(200).json({ message: "get data All success", datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    ubahStatus: async(req, res, next) => {
        try {
            const { status } = req.body
            if(!status) return res.status(400).json({message: "Tolong kirimkan status"});
            const statusAllowed = ['dikirim', 'berhasil', 'dibatalkan']
            if(!statusAllowed.includes(status)) return res.status(400).json({message: `Status tidak valid`});
            const pengiriman = await Pengiriman.findById(req.params.id)
            if(pengiriman.distributorId.toString() !== req.user.id) return res.status(403).json({message: "Tidak Bisa Mengubah Pengiriman Orang Lain!"});
            await Pengiriman.updateOne({_id: req.params.id}, {
                status_pengiriman: status
            })
            return res.status(200).json({message: "Berhasil Mengubah Status Pengiriman"})
        } catch (error) {
            console.log(error);
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

            const datas = await Pesanan.findOne({ _id: id_pesanan })

            // const datas = await PesananDistributor.create({ id_kendaraanDistributor, id_pesanan, alamatKonsument, alamatTokoVendor, konsumen, vendor, jasaOngkir })

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