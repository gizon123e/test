const Report = require("../models/model-laporan-penjualan");
const Performance = require('../models/model-laporan-kinerja-product');
const SalesReport = require("../models/model-laporan-penjualan");
const Product = require("../models/model-product");
const product = require("./product");

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
        const now = new Date(new Date().toISOString().split('T')[0]);
        const fewDaysAgo = new Date(now);
        fewDaysAgo.setDate(now.getDate() - periode_hari);

        let totalSold = 0;
        const filteredTrack = laporan.track.filter((obj)=>{
          return  obj.time >= fewDaysAgo && obj.time <= now
        }).map(track => {
          totalSold += track.soldAtMoment
          return { 
            tanggal: `${track.time.getDate()} ${getNamaBulan(track.time.getMonth() + 1)}`, 
            terjual: track.soldAtMoment,
            waktu: track.time
          };
        }).sort((a, b) => {
          return a.waktu - b.waktu;
        });

        const data = { namaProduct: laporan.productId.name_product, dataPenjualan: filteredTrack, totalTerjual: totalSold}
        return res.status(200).json({message:"Berikut Data Penjualan untuk Produk Ini", data })
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
        const now = new Date(new Date().toISOString().split('T')[0]);
        const fewDaysAgo = new Date(now);
        fewDaysAgo.setDate(now.getDate() - periode_hari);

        let counterImpressions = 0;
        let counterViews = 0;

        const impressionsTrack = laporan.impressions.filter((obj)=>{
          return obj.time >= fewDaysAgo && obj.time <= now
        }).map(impression => {
          counterImpressions += impression.amount
          return { 
            tanggal: `${impression.time.getDate()} ${getNamaBulan(impression.time.getMonth() + 1)}`, 
            jumlah: impression.amount,
            waktu: impression.time
          };
        }).sort((a, b) => {
          return a.waktu - b.waktu;
        });

        const viewsTrack = laporan.views.filter((obj)=>{
          return  obj.time >= fewDaysAgo && obj.time <= now;
        }).map(views => {
          counterViews += views.amount;
          return { 
            tanggal: `${views.time.getDate()} ${getNamaBulan(views.time.getMonth() + 1)}`, 
            jumlah: views.amount,
            waktu: views.time
          };
        }).sort((a, b) => {
          return a.waktu - b.waktu;
        });

        
        return res.status(200).json({message:"Berikut Data Performa untuk Produk Ini", data: {
          namaProduct: laporan.productId.name_product,
          dataImpresi: impressionsTrack,
          dataViews: viewsTrack, 
          totalImpression: counterImpressions,
          totalViews: counterViews
        }});

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
      
      const now = new Date(new Date().toISOString().split('T')[0]);
      const fewDaysAgo = new Date(now);
      fewDaysAgo.setDate(now.getDate() - parseInt(periode_hari));

      const data = []
      //iterasi laporan tiap product
      for (const product of listProducts){
        let counterImpressions = 0;
        let counterViews = 0
        let counterSold = 0
        const performance = await Performance.findOne({productId: product._id});
        const sales = await SalesReport.findOne({productId: product._id});
        const filteredImpressions = ()=>{
          if(performance){
            const data = performance.impressions.filter((obj)=>{
              return obj.time >= fewDaysAgo && obj.time <= now
            }).map((impression) =>{
              counterImpressions += impression.amount
              return { 
                tanggal: `${impression.time.getDate()} ${getNamaBulan(impression.time.getMonth() + 1)}`, 
                jumlah: impression.amount,
                waktu: impression.time
              };
            }).sort((a,b)=>{
              return a.waktu - b.waktu;
            })
            return data
          }else{
            return []
          }
        }

        const filteredViews = ()=>{
          if(performance){
            const data = performance.views.filter((obj)=>{
              return obj.time >= fewDaysAgo && obj.time <= now
            }).map((view) =>{
              counterViews += view.amount;
              return { 
                tanggal: `${view.time.getDate()} ${getNamaBulan(view.time.getMonth() + 1)}`, 
                jumlah: view.amount,
                waktu: view.time
              };
            }).sort((a,b)=>{
              return a.waktu - b.waktu;
            })
            return data
          }else{
            return []
          }
        }

        const filteredSales = ()=>{
          if(sales){
            const data = sales.track.filter((obj)=>{
              return obj.time >= fewDaysAgo && obj.time <= now
            }).map(track =>{
              counterSold += track.soldAtMoment
              return { 
                tanggal: `${track.time.getDate()} ${getNamaBulan(track.time.getMonth() + 1)}`, 
                jumlah: track.soldAtMoment,
                waktu: track.time
              };
            }).sort((a,b)=>{
              return a.waktu - b.waktu;
            })
            return data
          }else{
            return []
          }
        }
      
        data.push({
          namaProduct: product.name_product,
          dataImpression: filteredImpressions(),
          dataViews: filteredViews(),
          dataPenjualan: filteredSales(),
          totalTerjual: counterSold,
          totalImpresi: counterImpressions,
          totalViews: counterViews
        });
      }      

      return res.status(200).json({message:"Berhasil melihat laporan trend untuk produk yang dimiliki user ini", data})

    } catch (error) {
      if(error.name==="CastError") return res.status(400).json({message: "Mohon diperiksa kembali data yang dikirim", error: err.message})
      console.log(error)
      next(error)
    }
  }
};
