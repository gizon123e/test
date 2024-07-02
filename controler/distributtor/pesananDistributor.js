const PesananDistributor = require("../../models/distributor/model-pesananDistributor")
const Pesanan = require('../../models/model-orders')
const Pengiriman = require("../../models/model-pengiriman")

module.exports = {
    getAllPesananDistributor: async (req, res, next) => {
        try {
            const datas = await Pesanan.find()
            if (!datas) return res.status(404).json({ message: "saat ini data pesanan distributor" })

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
            if(!pengiriman) return res.status(404).json({message: `Tidak ada pengiriman dengan id: ${req.params.id}`})
            if(pengiriman.distributorId.toString() !== req.user.id) return res.status(403).json({message: "Tidak Bisa Mengubah Pengiriman Orang Lain!"});
            await Pengiriman.updateOne({_id: req.params.id}, {
                status_pengiriman: status
            })
            return res.status(200).json({message: "Berhasil Mengubah Status Pengiriman"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}