const Product = require('../models/model-product')
const User = require("../models/model-auth-user")
const Pesanan = require("../models/model-pesanan")
module.exports= {
    make: async(req, res, next) => {
        try {
            const produkDipesan = []
            const pelanggan = await User.findById(req.body.pelanggan_id)

            if(!pelanggan) return res.status(404).json({message:`user dengan id: ${req.body.pelanggan_id} tidak ditemukan`})

            for (const item of req.body.produk){
                const produk = await Product.findById(item.produk_id)

                if(!produk) return res.status(404).json({message: `produk dengan id: ${item.produk_id} tidak ditemukan`})

                produkDipesan.push({
                    produkID: produk._id,
                    jumlah: item.jumlah
                })
            }

            Pesanan.create({
                pelanggan_id: pelanggan._id,
                produk: produkDipesan,
                status: req.body.status
            }).then((pesanan)=>{
                return res.status(200).json({message:"Berhasil Membuat Pesanan", pesanan})
            })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: "Internal Error Server"})
        }
    }
}