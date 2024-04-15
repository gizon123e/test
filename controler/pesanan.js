const Product = require('../models/model-product')
const User = require("../models/model-auth-user")
const Pesanan = require("../models/model-pesanan")
const Report = require("../models/model-laporan-penjualan")
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
                const report = await Report.findOne({product_id: produk._id})

                if(!report){
                    const laporan = await Report.create({
                        product_id: produk._id,
                        track:[
                            {time: new Date(), soldAtMoment: item.jumlah}
                        ]
                    })
                }else{
                    report.track.push({time: new Date(), soldAtMoment: item.jumlah})
                    await report.save()
                }
            }

            const pesanan = await Pesanan.create({
                pelanggan_id: req.body.pelanggan_id,
                produk: produkDipesan,
                status: req.body.status,
                sellerID: req.body.sellerID
            })

            return res.status(200).json({message:"Berhasil Membuat Pesanan", pesanan})
            
        } catch (err) {
            console.log("errornya: " + err)
            next(err)
        }
    },
    list_pesanan: async (req,res,next)=>{
        try {
            const list_pesanan = await Pesanan.find({sellerID: req.user.id})
            if(!list_pesanan) return res.status(404).json({message: "Tidak Ada Pesanan"})
            return res.status(200).json({datas:list_pesanan})
        } catch (err) {
            console.log(err)
            next(err)
        }
    },
    update_status: async(req, res, next) =>{
        try {
            if(!req.body.pesananID) return res.status(401).json({message:`Dibutuhkan payload dengan nama pesananID`})
            const pesanan = await Pesanan.findByIdAndUpdate(req.body.pesananID, {status: req.body.status},{new:true})
            if(!pesanan) return res.status(404).json({message:`pesanan dengan id: ${req.body.pesananID} tidak ditemukan`})
            return res.status(200).json({datas:pesanan})
        } catch (err) {
            console.log(err)
            next(err)
        }
    }
}