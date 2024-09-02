const Distributtor = require('../../models/distributor/model-distributor');
const Pengiriman = require('../../models/model-pengiriman');
const { Transaksi } = require('../../models/model-transaksi');
const mongoose = require("mongoose")
const now = new Date();
const startOfToday = new Date(now.setHours(0, 0, 0, 0));
const endOfToday = new Date(now.setHours(23, 59, 59, 999));

module.exports = {
    getTotalPenghasilan: async(req, res, next) => {
        try {
            const transaksis = await Transaksi.find({userId: req.user.id}).lean()
            const total_penghasilan = transaksis.filter(tr => tr.jenis_transaksi == "masuk").reduce((acc, val)=> acc+val.jumlah, 0) - transaksis.filter(tr => tr.jenis_transaksi == "keluar").reduce((acc, val)=> acc+val.jumlah, 0)
            return res.status(200).json({message: "Berhasil mendapatkan seluruh penghasilan", total_penghasilan})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getPenghasilan: async(req, res, next) => {
        try {
            const { day, dateStart, dateEnd } = req.query
            const filter = {
                userId: req.user.id
            }

            if(!day && (!dateStart && !dateEnd)) return res.status(400).json({message: "Kirimkan query day"})

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
            .sort({createdAt: -1})
            .lean();
            const distri = await Distributtor.exists({userId: req.user.id})
            const shipments = await Pengiriman.find({distributorId: distri._id, createdAt: filter.createdAt}).lean();
            const total_penghasilan = transaksis.filter(tr => tr.jenis_transaksi === "masuk").reduce((acc, val)=> acc + val.jumlah, 0) - transaksis.filter(tr => tr.jenis_transaksi === "keluar").reduce((acc, val)=> acc + val.jumlah, 0)
            let total_produk = 0;
            let total_quantity = 0;
            const addedShipment = new Set()
            for(sp of shipments){
                const total = sp.productToDelivers.reduce((acc, val)=> {
                    if(!addedShipment.has(val.productId.toString())){
                        total_produk += 1;
                        addedShipment.add(val.productId.toString())
                    }
                    return acc + val.quantity
                },0)
                total_quantity += total
            };
            
            return res.status(200).json({message: "Berhasil menampilkan penghasilan", total_penghasilan , total: { total_produk, total_quantity } })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getRiwayatKeuangan: async(req, res, next) => {
        try {
            const { bulan } = req.query;

            const filter = {
                userId: req.user.id
            }

            if (bulan) {
                const bulanMap = {
                    'januari': 0,
                    'februari': 1,
                    'maret': 2,
                    'april': 3,
                    'mei': 4,
                    'juni': 5,
                    'juli': 6,
                    'agustus': 7,
                    'september': 8,
                    'oktober': 9,
                    'november': 10,
                    'desember': 11
                };
        
                const monthIndex = bulanMap[bulan.toLowerCase()];
                
                if (monthIndex !== undefined) {
                    const start = new Date(new Date().getFullYear(), monthIndex, 1);
                    const end = new Date(new Date().getFullYear(), monthIndex + 1, 0, 23, 59, 59);
        
                    filter.createdAt = {
                        $gte: start,
                        $lte: end
                    };
                } else {
                    return res.status(400).json({ message: "Bulan tidak valid" });
                }
            }

            const transaksi = await Transaksi.find(filter).sort({createdAt: -1}).lean();
            if(transaksi.length === 0) return res.status(200).json({message: `Tidak Ada Penghasilan di bulan ${bulan.charAt(0).toUpperCase() + bulan.slice(1).toLowerCase()}`})
            return res.status(200).json({message: "Berhasil menampilkan riwayat keuangan", data: transaksi })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getGrafikPenghasilan: async(req, res, next) => {
        try {
            const { tahun } = req.query;
            const year = parseInt(tahun, 10) || new Date().getFullYear();
        
            const result = await Transaksi.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(req.user.id),
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31, 23, 59, 59)
                        }
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalMasuk: {
                            $sum: {
                                $cond: [{ $eq: ["$jenis_transaksi", "masuk"] }, "$jumlah", 0]
                            }
                        },
                        totalKeluar: {
                            $sum: {
                                $cond: [{ $eq: ["$jenis_transaksi", "keluar"] }, "$jumlah", 0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        totalMasuk: 1,
                        totalKeluar: 1,
                        totalPenghasilan: { $subtract: ["$totalMasuk", "$totalKeluar"] }
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ]);
        
            if (result.length === 0) {
                return res.status(200).json({ 
                    message: `Tidak Ada Penghasilan di tahun ${year}`
                });
            }
        
            const bulanMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const data = result.map(item => ({
                bulan: bulanMap[item.month - 1],
                totalPenghasilan: item.totalPenghasilan
            }));
        
            return res.status(200).json({
                message: "Berhasil menghitung saldo keuangan per bulan",
                data: data
            });
        } catch (error) {
            console.log(error);
            next(error);
        }        
        
    }
}