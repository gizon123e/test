const Distributtor = require('../../models/distributor/model-distributor');
const Pengiriman = require('../../models/model-pengiriman');
const { Transaksi } = require('../../models/model-transaksi');
const now = new Date();
now.setHours(0, 0, 0, 0);
const tomorrow = new Date(now);
module.exports = {
    getPenghasilan: async(req, res, next) => {
        try {
            const transaksis = await Transaksi.find({
                userId: req.user.id
            })
            .lean();
            const distri = await Distributtor.exists({userId: req.user.id})
            const pengirimans = await Pengiriman.find({distributorId: distri._id}).lean()
            const addedProduct = new Set();
            let total_produk = 0;
            let total_quantity = 0;
            for(const pgr of pengirimans){
                for(prd of pgr.productToDelivers){
                    if(!addedProduct.has(prd._id)){
                        total_produk += 1
                        addedProduct.add(prd._id)
                    }
                    console.log(prd.quantity)
                    total_quantity += prd.quantity
                }
            }
            const total_penghasilan = transaksis.filter(tr => tr.jenis_transaksi === "masuk").reduce((acc, val)=> acc + val.jumlah, 0) - transaksis.filter(tr => tr.jenis_transaksi === "keluar").reduce((acc, val)=> acc + val.jumlah, 0)
            return res.status(200).json({message: "Berhasil menampilkan penghasilan", total_penghasilan , data: transaksis, total: { total_produk, total_quantity } })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}