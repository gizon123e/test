const Product = require('../models/model-product')
const User = require("../models/model-auth-user")
const Pesanan = require("../models/model-pesanan")
module.exports= {
    make: async(req, res, next) => {
        try {
            const produkDipesan = []
            // const pelanggan = await User.findById(req.body.pelanggan_id)

            // if(!pelanggan) return res.status(404).json({message:`user dengan id: ${req.body.pelanggan_id} tidak ditemukan`})

            //Dua baris kode diatas kira kira harus dipake gak ya mas?
            if(!req.body.produk) return res.status(404).json({message: `Array produk tidak ditemukan payload yang dikirim\n${req.body}`})
            for (const item of req.body.produk){
                const produk = await Product.findById(item.produk_id)

                if(!produk) return res.status(404).json({message: `produk dengan id: ${item.produk_id} tidak ditemukan`})

                produkDipesan.push({
                    produkID: produk._id,
                    jumlah: item.jumlah
                })
            }

            Pesanan.create({
                pelanggan_id: req.body.pelanggan_id,
                produk: produkDipesan,
                status: req.body.status,
                sellerID: req.body.sellerID
            }).then((pesanan)=>{
                return res.status(200).json({message:"Berhasil Membuat Pesanan", pesanan})
            })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: "Internal Error Server"})
        }
    },
    list_pesanan: async (req,res,next)=>{
        try {
            const list_pesanan = await Pesanan.findOne({sellerID: req.user.id})
            if(!list_pesanan) return res.status(404).json({message: "Tidak Ada Pesanan"})
            return res.status(200).json({datas:list_pesanan})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: "Internal Error Server"})
        }
    },
    update_status: async(req, res, next) =>{
        try {
            const pesanan = await Pesanan.findByIdAndUpdate(req.body.pesananID, {status: req.body.status},{new:true})
            if(!pesanan) return res.status(404).json({message:`pesanan dengan id: ${req.body.pesananID} tidak ditemukan`})
            return res.status(200).json({datas:pesanan})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: "Internal Error Server"})
        }
    }
}