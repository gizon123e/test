const Pengiriman = require("../../models/model-pengiriman");

module.exports = {
    requestPickUp: async(req, res, next) => {
        try {
            const pengiriman = await Pengiriman.findOne({ _id: req.params.id, id_toko: req.body.sellerId });
            if(!pengiriman) return res.status(404).json({message: `Pengiriman dengan Id ${req.params.id} tidak ditemukan`})
            if(pengiriman.status_distributor === 'Pesanan terbaru') return res.status(403).json({message: "Distributor belum bersedia"})
            const updatedPengiriman = await Pengiriman.findOneAndUpdate(
                { _id: req.params.id, id_toko: req.body.sellerId }, 
                {
                    isRequestedToPickUp: true,
                }, 
            { new: true });
            return res.status(200).json({message: "Berhasil Mengajukan Pengajuan", data: updatedPengiriman})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}