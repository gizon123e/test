const Distributtor = require("../../models/distributor/model-distributor")
const Pesanan = require('../../models/model-orders')
const { io } = require("socket.io-client");
const Pengiriman = require("../../models/model-pengiriman");
const Product = require("../../models/model-product");

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
            const pengiriman = await Pengiriman.findById(req.params.id).populate('orderId')
            if(!pengiriman) return res.status(404).json({message: `Tidak ada pengiriman dengan id: ${req.params.id}`});
            const distri = await Distributtor.findById(pengiriman.distributorId)
            if(distri.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak Bisa Mengubah Pengiriman Orang Lain!"});
            await Pengiriman.updateOne({_id: req.params.id}, {
                status_pengiriman: status
            });
            const socket = io('https://staging-backend.superdigitalapps.my.id/', {
                auth:{
                    fromServer: true
                }
            })
            const prodIds = pengiriman.productToDelivers.map(item => {
                return item.productId
            })

            const products = await Product.find({_id: { $in: prodIds }})
            for(const product of products){
                socket.emit('notif_order', { userId: pengiriman.orderId.userId, message: `Pesanan ${product.name_product} telah dikirim`} )
            }
            // socket.disconnect()
            return res.status(200).json({message: "Berhasil Mengubah Status Pengiriman"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}