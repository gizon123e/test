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
                userId: req.user.id
            })
            .lean();
            console.log(req.user)
            const products = (await Product.find({userId: req.user.id}).lean()).map(prod => prod._id);
            const salesReport = await SalesReport.find({productId: { $in: products }});
            const total_penghasilan = transaksis.filter(tr => tr.jenis_transaksi === "masuk").reduce((acc, val)=> acc + val.jumlah, 0) - transaksis.filter(tr => tr.jenis_transaksi === "keluar").reduce((acc, val)=> acc + val.jumlah, 0)
            let total_produk = 0;
            let total_quantity = 0;
            const addedProduct = new Set()
            for(sp of salesReport){
                if(!addedProduct.has(sp.productId)){
                    total_produk += 1;
                }
                total_quantity += sp.track.reduce((acc, val) => acc + val.soldAtMoment, 0)
            };
            
            return res.status(200).json({message: "Berhasil menampilkan penghasilan", total_penghasilan , data: transaksis, total: { total_produk, total_quantity } })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}