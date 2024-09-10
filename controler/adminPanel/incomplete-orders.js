const Pembatalan = require("../../models/model-pembatalan");
const Pengiriman = require("../../models/model-pengiriman");
const IncompleteOrders = require("../../models/pesanan/model-incomplete-orders");

module.exports = {
    getIncompleteOrders: async (req, res, next) => {
        try {
            if(req.user.role !== 'administrator') return res.status(401).jsno({message: "Invalid Request"});
            const data = await IncompleteOrders.find();
            return res.status(200).json({message: "berhasil mendapatkan order tidak terpenuhi", data})
            
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    acceptIncompeleteOrder: async(req, res, next) => {
        try {
            if(req.user.role !== 'administrator') return res.status(401).jsno({message: "Invalid Request"});
            const { id } = req.body;
            const data = await IncompleteOrders.findById(id);
            await Pengiriman.findByIdAndUpdate(data.pengirimanId, { sellerApproved: true, amountCapable: completedOrders });
            return res.status(200).json({message: "Berhasil menyetujui pesanan"})
        }catch (error) {
            console.log(error);
            next(error)
        }
    },

    cancelIncompleteOrder: async(req, res, next) => {
        try {
            if(req.user.role !== 'administrator') return res.status(401).jsno({message: "Invalid Request"});
            const { id, reason } = req.body
            const data = await IncompleteOrders.findById(id);
            await Pembatalan.create({reason, pengirimanId: data.pengirimanId});
            return res.status(200).json({message: "Berhasil membatalkan pesanan"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}