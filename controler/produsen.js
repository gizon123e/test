const Produksi = require("../models/model-produksi")
const Product = require("../models/model-product")
const BahanBaku = require("../models/models-bahan_baku")


module.exports = {
    createProduction: async (req, res, next) =>{
        try {
            const { productId, status, quantity } = req.body
            
            if(req.user.role !== "produsen") return res.status(403).json({message: "Hanya produsen yang bisa menjadwalkan produksi barang"})
            
            const product = await Product.findById(productId).populate({
                path: "bahanBaku",
                populate: {
                    path: "bahanBakuId",
                    model: "BahanBaku"
                }
            })
            
            for ( const bahan of product.bahanBaku ){
                if(bahan.bahanBakuId.quantity < (bahan.quantityNeed * quantity)){
                    return res.status(403).json({message: `Bahan Baku kurang. Bahan baku yang tersedia ${bahan.bahanBakuId.quantity}, bahan baku yang dibutuhkan ${bahan.quantityNeed * quantity}`})
                }
                const bahanBaku = await BahanBaku.findById(bahan.bahanBakuId._id)
                bahanBaku.quantity -= bahan.quantityNeed * quantity
                await bahanBaku.save()
            }

            if ( !productId || !status || !quantity ) return res.status(400).json({
                message: `Payload yang dibutuhkan tidak ada. productId: ${productId} status: ${status} quantity: ${quantity}`
            })
            
            const produksi = await Produksi.findOne({productId})

            if(produksi) return res.status(400).json({message: "Barang ini sedang dijalankan produksinya"})
            
            const data = await Produksi.create({ productId, userId: req.user.id, status, quantity })

            return res.status(200).json({message: "Berhasil menjadwalkan produksi untuk produk ini", data})
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createBahanBaku: async(req, res, next)=>{
        try {
            const { productId, quantity, name_bahan } = req.body
            console.log(new RegExp(name_bahan, "i"))
            const bahan = await BahanBaku.findOne({ 
                userId: req.user.id,
                name: { $regex: new RegExp(name_bahan ,'i') }
            })
            if(bahan){
                res.status(400).json({message: "Anda sudah memiliki bahan " + name_bahan, data: bahan})
            }else{
                const bahan = await BahanBaku.create({
                    productId, 
                    quantity, 
                    userId: req.user.id,
                    name: name_bahan
                })
                res.status(200).json({message: "Berhasil menambahkan bahan baku", data: bahan})
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateBahanBaku: async (req, res, next) =>{
        
    }
}