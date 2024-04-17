const Produksi = require("../models/model-produksi")
const Product = require("../models/model-product")


module.exports = {
    createProduction: async (req, res, next) =>{
        try {
            const { productId, userId, status, jumlah } = req.body
            
            if(req.user.role !== "produsen") return res.status(403).json({message: "Hanya produsen yang bisa menjadwalkan produksi barang"})
            
            const product = await Product.findById(productId).populate({
                path: "bahan_baku",
                populate: {
                    path: "bahanBakuId",
                    model: "BahanBaku"
                }
            })
            

            if (!productId || !userId || !status || jumlah ) return res.status(400).json({
                message: `Payload yang dibutuhkan tidak ada. productId: ${productId} userId: ${userId} status: ${status} jumlah: ${jumlah}`
            })
            
            const produksi = await Produksi.findOne({productId})

            if(produksi) return res.status(400).json({message: "Barang ini sedang dijalankan produksinya"})
            
            const data = await Produksi.create({ productId, userId, status, jumlah })

            return res.status(200).json({message: "Berhasil menjadwalkan produksi untuk produk ini", data})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}