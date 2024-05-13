const Promo = require('../models/model-promo');
const Konsumen = require("../models/konsumen/model-konsumen")
const path = require('path')

module.exports = {
    addPromo: async (req, res, next) => {
        try {
            const promo = await Promo.findOne({productId: req.body.productId})
            const konsumen = await Konsumen.findOne({userId: req.user.id});
            // if(promo.productId.userId.toString() != req.user.id) return res.status(403).json({message: "Tidak bisa menambahkan Promo untuk produk orang lain"})
            if(promo) return res.status(400).json({message: "Product Sedang Promo"});
            if(!req.files.banner) return res.status(400).json({message: "Harus Mengirimkan Banner!"});
            const bannerFile = `${Date.now()}_${konsumen.namaBadanUsaha || konsumen.nama}_${path.extname(req.files.banner.name)}`;
            const bannerPath = path.join(__dirname, '../public', 'profile_picts', bannerFile);
            console.log(bannerPath)
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
    }
}