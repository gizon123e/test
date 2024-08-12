const SalesReport = require('../../models/model-laporan-penjualan');
const Product = require('../../models/model-product');
const { Transaksi } = require('../../models/model-transaksi');
const now = new Date();
const startOfToday = new Date(now.setHours(0, 0, 0, 0));
const endOfToday = new Date(now.setHours(23, 59, 59, 999));

module.exports = {
    getPenghasilan: async(req, res, next) => {
        try {
            const { day, dateStart, dateEnd } = req.query
            const filter = {
                userId: req.user.id
            }

            if(day === "Hari ini"){
                filter.createdAt = {
                    $gte: startOfToday,
                    $lte: endOfToday
                }
            }

            if (day === "Kemarin") {
                const startOfYesterday = new Date(startOfToday);
                startOfYesterday.setDate(startOfYesterday.getDate() - 1);
                const endOfYesterday = new Date(endOfToday);
                endOfYesterday.setDate(endOfYesterday.getDate() - 1);
            
                filter.createdAt = {
                    $gte: startOfYesterday,
                    $lte: endOfYesterday,
                };
            }

            if (day === "7 hari") {
                const sevenDaysAgo = new Date(startOfToday);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
                filter.createdAt = {
                    $gte: sevenDaysAgo,
                    $lte: endOfToday,
                };
            }

            if(dateStart && dateEnd){
                if(!dateStart instanceof Date || !dateEnd instanceof Date){
                    return res.status(400).json({message: "dateStart atau dateEnd dikirimkan dalam format salah"})
                }
                filter.createdAt = {
                    $gte: dateStart,
                    $lte: dateEnd,
                };
            }
            
            const transaksis = await Transaksi.find(filter)
            .lean();
            const products = (await Product.find({userId: req.user.id}).lean()).map(prod => prod._id);
            const salesReport = await SalesReport.aggregate([
                {
                    $match: {
                        productId: { $in: products },
                    },
                },
                {
                    $project: {
                        productId: 1,
                        track: {
                            $filter: {
                                input: "$track",
                                as: "item",
                                cond: {
                                    $and: [
                                        { $gte: ["$$item.time", filter.createdAt.$gte] },
                                        { $lte: ["$$item.time", filter.createdAt.$lte] }
                                    ],
                                },
                            },
                        },
                    },
                },
            ]).exec();

            const total_penghasilan = transaksis.filter(tr => tr.jenis_transaksi === "masuk").reduce((acc, val)=> acc + val.jumlah, 0) - transaksis.filter(tr => tr.jenis_transaksi === "keluar").reduce((acc, val)=> acc + val.jumlah, 0)
            let total_produk = 0;
            let total_quantity = 0;
            const addedProduct = new Set()
            for(sp of salesReport){
                total_quantity += sp.track.reduce((acc, val) => {
                    if(!addedProduct.has(sp.productId)){
                        total_produk += 1;
                        addedProduct.add(sp.productId)
                    }
                    return acc + val.soldAtMoment
                }, 0)
            };
            
            return res.status(200).json({message: "Berhasil menampilkan penghasilan", total_penghasilan , data: transaksis, total: { total_produk, total_quantity } })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}