const SalesReport = require('../../models/model-laporan-penjualan');
const Product = require('../../models/model-product');
const { Transaksi } = require('../../models/model-transaksi');
const now = new Date();
now.setHours(0, 0, 0, 0);
const tomorrow = new Date(now);
module.exports = {
    getPenghasilan: async(req, res, next) => {
        try {
            const transaksis = await Transaksi.find({
                userId: req.user.id,
                createdAt: {
                    $gte: now
                }
            })
            .lean();

            const products = (await Product.find({userId: req.user.id}).lean()).map(prod => prod._id);
            const salesReport = await SalesReport.find({productId: { $in: products }});
            let total_terjual = 0;
            const total_penghasilan = transaksis.filter(tr => tr.jenis_transaksi === "masuk").reduce((acc, val)=> acc + val.jumlah, 0)

            for(sp of salesReport){
                sp.track.map(tr => total_terjual += tr.soldAtMoment)
            };
            
            return res.status(200).json({message: "Berhasil menampilkan penghasilan", total_penghasilan , data: transaksis, totalProdukTerjual: total_terjual })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}