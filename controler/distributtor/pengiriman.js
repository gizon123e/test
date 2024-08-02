const Pengiriman = require("../../models/model-pengiriman");

module.exports = {
    requestPickUp: async(req, res, next) => {
        try {
            const pengiriman = await Pengiriman.findOneAndUpdate(
                { _id: req.params.id, id_toko: req.body.sellerId }, 
                {
                    isRequestedToPickUp: true,
                }, 
            { new: true });
            if(!pengiriman) return res.status(404).json({message: `Pengiriman dengan Id ${req.params.id} tidak ditemukan`})
            return res.status(200).json({message: "Berhasil Mengajukan Pengajuan", data: pengiriman})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}