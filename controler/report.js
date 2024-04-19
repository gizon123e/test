const Report = require("../models/model-laporan-penjualan");
const Performance = require('../models/model-laporan-kinerja-product');
const SalesReport = require("../models/model-laporan-penjualan");
const Product = require("../models/model-product");

function getNamaBulan(angka){
  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  if(angka => 1 && angka <= 12){
    return namaBulan[angka - 1]
  }else{
    return `Tidak ada bulan ke-${angka}`
  }
}

module.exports = {

  salesReportPerProduct: async function (req, res, next) {
    try {
      const { productId, periode_hari } = req.query;

      if(!productId) return res.status(400).json({messageL:"Dibutuhkan payload productId"})

      const laporan = await Report.findOne({ productId }).populate("productId");
      
      if(!laporan) return res.status(404).json({message: `produk dengan id: ${productId} belum memiliki penjualan`})

      if(!laporan.productId) return res.status(404).json({message: `Tidak ada produk dengan id: ${productId}`})

      if(laporan.productId.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak bisa melihat data orang lain!!"})

      if(parseInt(periode_hari)){
        const now = new Date()
        const fewDaysAgo = new Date(now.getTime() - periode_hari * 24 * 60 * 60 * 1000);
        const filteredTrack = laporan.track.filter((obj)=>{
          return obj.time.getDate() <= fewDaysAgo.getDate()
        })
        const data = []
        let totalSold = 0
        for (const item of filteredTrack){
          data.push({
            tanggal: `${item.time.getDate()} ${getNamaBulan(item.time.getMonth() + 1)}`,
            terjual: item.soldAtMoment
          })
          totalSold += item.soldAtMoment
        }
        return res.status(200).json({message:"Berikut Data Penjualan untuk Produk Ini", data:{ data, totalTerjual: totalSold }})
      }else{
        return res.status(400).json({message: "Tolong Berikan Data Angka", error: true})
      }

    } catch (err) {
      if(err.name==="CastError") return res.status(400).json({message: "Mohon diperiksa kembali data yang dikirim", error: err.message})
      next(err)
    }
  },
  
  performancePerProduct: async (req, res, next) =>{
    try {
      const { productId, periode_hari } = req.query;

      if(!productId) return res.status(400).json({message:"Dibutuhkan payload productId"})

      const laporan = await Performance.findOne({ productId }).populate("productId");

      if(!laporan) return res.status(404).json({message: `tidak ditemukan laporan kinerjan dari produk dengan id: ${productId}`})

      if(laporan.productId.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak bisa melihat data orang lain!!"})

      if(parseInt(periode_hari)){

        const now = new Date()

        const fewDaysAgo = new Date(now.getTime() - periode_hari * 24 * 60 * 60 * 1000);

        const impressionsTrack = laporan.impressions.filter((obj)=>{
          return obj.time.getDate() <= fewDaysAgo.getDate()
        })

        const viewsTrack = laporan.views.filter((obj)=>{
          return obj.time.getDate() <= fewDaysAgo.getDate()
        })

        const data = []
        let counterImpressions = 0
        let counterViews = 0

        for (const item of impressionsTrack){
          data.push({
            tanggal: `${item.time.getDate()} ${getNamaBulan(item.time.getMonth() + 1)}`,
            totalImpressions: item.amount
          })
          counterImpressions += item.amount
        }

        for (const item of viewsTrack){
          data.push({
            tanggal: `${item.time.getDate()} ${getNamaBulan(item.time.getMonth() + 1)}`,
            totalViews: item.amount
          })
          counterViews += item.amount
        }

        return res.status(200).json({message:"Berikut Data Penjualan untuk Produk Ini", data: {
          data, 
          totalImpression: counterImpressions,
          totalViews: counterViews
        }})

      }

    } catch (err) {
      console.log(err)
      if(err.name==="CastError") return res.status(400).json({message: "Mohon diperiksa kembali data yang dikirim", error: err.message})
      next(err)
    }
  },

  trendReport: async (req, res, next) =>{
    try {
      const { periode_hari } = req.query
      //cari produk yang dimiliki user
      const listProducts = await Product.find({userId: req.user.id})

      if(!listProducts || listProducts.length == 0) return res.status(404).json({message: "User tidak memiliki produk", user: req.user})
      
      const fewDaysAgo = new Date(new Date().getTime() - periode_hari * 24 * 60 * 60 * 1000)
      console.log(fewDaysAgo.getDate())
      const hasilTrends = []

      //iterasi laporan tiap product
      for (const product of listProducts){
        const performance = await Performance.findOne({productId: product._id})
        const sales = await SalesReport.findOne({productId: product._id})

        const filteredImpression = performance.impressions.filter(impression =>{
          return impression.time.getDate() <= fewDaysAgo.getDate() || impression.time.getDate() <= new Date().getDate()
        }).map(impression => {
          return { 
            tanggal: `${impression.time.getDate()} ${getNamaBulan(impression.time.getMonth() + 1)}`, 
            jumlah: impression.amount,
            waktu: impression.time
          };
        }).sort((a, b) => {
          return a.waktu - b.waktu;
        });

        const filteredViews = performance.views.filter(views =>{
          return views.time.getDate() <= fewDaysAgo.getDate() || views.time.getDate() <= new Date().getDate()
        }).map(views => {
          return { 
            tanggal: `${views.time.getDate()} ${getNamaBulan(views.time.getMonth() + 1)}`, 
            jumlah: views.amount,
            waktu: views.time
          };
        }).sort((a, b) => {
          return a.waktu - b.waktu;
        });
        
        const filteredSales = sales.track.filter(track =>{
          return track.time.getDate() <= fewDaysAgo.getDate() || track.time.getDate() <= new Date().getDate()
        }).map(track => {
          return { 
            tanggal: `${track.time.getDate()} ${getNamaBulan(track.time.getMonth() + 1)}`, 
            terjual: track.soldAtMoment,
            waktu: track.time
          };
        }).sort((a, b) => {
          return a.waktu - b.waktu;
        });

        hasilTrends.push({
          namaProduct: product.name_product,
          impressions: filteredImpression,
          views: filteredViews,
          penjualan: filteredSales
        })

      }
      res.status(200).json({message:"Berhasil melihat laporan trend untuk produk yang dimilik user ini",data: hasilTrends})
    } catch (error) {
      if(error.name==="CastError") return res.status(400).json({message: "Mohon diperiksa kembali data yang dikirim", error: err.message})
      console.log(error)
    }
  }
};
