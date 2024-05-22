const Promo = require('../models/model-promo');
const Vendor = require("../models/vendor/model-vendor");
const Minat = require("../models/model-minat-user");
const path = require('path');
const dotenv = require("dotenv");

module.exports = {
    addPromo: async (req, res, next) => {
        try {
            const promo = await Promo.findOne({productId: req.body.productId}).populate('productId')
            const vendor = await Vendor.findOne({userId: req.user.id});
            if(promo) return res.status(400).json({message: "Product Sedang Promo"});
            if(promo.productId.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak bisa menambahkan Promo untuk produk orang lain"})
            if(!req.files.banner) return res.status(400).json({message: "Harus Mengirimkan Banner!"});
            const bannerFile = `${Date.now()}_${vendor.namaBadanUsaha || vendor.nama}_${path.extname(req.files.banner.name)}`;
            const bannerPath = path.join(__dirname, '../public', 'profile_picts', bannerFile);
            await req.files.banner.mv(bannerPath);

            const newPromo = await Promo.create({
                productId: req.body.productId,
                banner: `${req.protocol}://${req.get('host')}/public/profile_picts/${bannerFile}`
            });

            return res.status(200).json({message: "Berhasil Membuat Promo", data: newPromo});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getPromo: async (req, res, next) =>{
        try {
            let data = [];
            const promo = await Promo.find().populate({
                path: 'productId',
                select: 'categoryId _id'
            });
            const minat = await Minat.findOne({userId: req.user.id});
            if(!minat) {
                data = promo;
                data.slice(0, 4);
                return res.status(200).json({message:"Berhasil Menampilkan Rekomendasi Promo Untuk User", data})
            }
            const categoryInterested = minat.categoryMinat.map(item => item.categoryId.toString())
            promo.forEach((e,i)=>{
                if(categoryInterested.includes(e.productId.categoryId.toString())){
                    data.push(e)
                };
            });
            data.slice(0, 4);
            return res.status(200).json({message:"Berhasil Menampilkan Rekomendasi Promo Untuk User", data})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}