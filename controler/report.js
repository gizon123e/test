const Report = require("../models/model-laporan-penjualan");
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
      const { product_id, periode_hari } = req.query;
      const laporan = await Report.findOne({ product_id }).populate("product_id");

      if(!laporan) return res.status(404).json({message: `produk dengan id: ${product_id} belum memiliki penjualan`})
      if(laporan.product_id.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak bisa melihat data orang lain!!"})

      if(periode_hari && periode_hari.trim().length !== 0){
        if(isNaN(parseInt(periode_hari))) return res.status(400).json({message: "Tolong Berikan Data Angka", error: true})
        const now = new Date()
        const fewDaysAgo = new Date(now.getTime() - periode_hari * 24 * 60 * 60 * 1000);
        const filteredTrack = laporan.track.filter((obj)=>{
          return obj.time.getTime() >= fewDaysAgo.getTime()
        })
        const data = []
        for (const item of filteredTrack){
          data.push({
            tanggal: `${item.time.getDate()} ${getNamaBulan(item.time.getMonth() + 1)}`,
            terjual: item.soldAtMoment
          })
        }
        return res.status(200).json({message:"Berikut Data Penjualan untuk Produk Ini", data})
      }

      res.json({ error: false, laporan });

    } catch (err) {
      if(err.name==="CastError") return res.status(400).json({message: "Mohon diperiksa kembali data yang dikirim", error: err.message})
      next(err)
    }
  }
};
