const Promo = require('../models/model-promo');
const Vendor = require("../models/vendor/model-vendor");
const Minat = require("../models/model-minat-user");
const path = require('path');
const dotenv = require("dotenv");

module.exports = {
    addPromo: async (req, res, next) => {
        try {
            const promo = await Promo.findOne({productId: req.body.productId}).populate('productId')
            if(promo) return res.status(400).json({message: "Product Sedang Promo"});
            const vendor = await Vendor.findOne({userId: req.user.id});
            if(!req.files.banner) return res.status(400).json({message: "Harus Mengirimkan Banner!"});
            const bannerFile = `${Date.now()}_${vendor.namaBadanUsaha || vendor.nama}_${path.extname(req.files.banner.name)}`;
            const bannerPath = path.join(__dirname, '../public', 'profile_picts', bannerFile);
            await req.files.banner.mv(bannerPath);

            const newPromo = await Promo.create({
                productId: req.body.productId,
                banner: `${process.env.HOST}/public/profile_picts/${bannerFile}`,
                typePromo: req.body.typePromo
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
            const minat = await Minat.findOne({userId: req.user.id}).lean()
            const promo = await Promo.aggregate([
                {
                    $lookup:{
                        from: "products",                            
                        localField: "productId",
                        foreignField: "_id",
                        as: "dataProducts"
                    }
                },
                {
                    $unwind: "$dataProducts"
                },
                {
                    $project: { "dataProducts._id": 1, "dataProducts.categoryId": 1, banner: 1 , typePromo: 1 }
                }
            ])
            if(!minat){
                data = promo
            }else{
                const categoryIds = minat.categoryMinat.map(item => {
                    return item.categoryId
                })
                promo.forEach(item => {
                    if(categoryIds.includes(item.dataProducts.categoryId)){
                        data.push(item)
                    }else{
                        data = promo
                    }
                })
            }
            data.slice(0 , 3)
            return res.status(200).json({message:"Berhasil Menampilkan Rekomendasi Promo Untuk User", data })
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}