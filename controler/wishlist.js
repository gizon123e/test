const Wishlist = require("../models/model-wishlist");
const Product = require("../models/model-product");
const SalesReport = require("../models/model-laporan-penjualan");
const TokoVendor = require("../models/vendor/model-toko");
const TokoSupplier = require("../models/supplier/model-toko");

module.exports = {
    getAllWishlist: async(req, res, next) => {
        try {
            const listWishList = await Wishlist.find({userId: req.user.id})
            .populate(
                { 
                    path: "productId", 
                    select: "name_product total_price image_product poin_review userId",
                    populate: {
                        path: "userId",
                        select: "role"
                    }
                })
            .lean()
            const data = await Promise.all(listWishList.map(async(wish)=> {
                const terjual = await SalesReport.findOne({productId: wish.productId}).select("track")
                let detailToko;
                switch(wish.productId.userId.role){
                    case "vendor":
                        detailToko = await TokoVendor.findOne({userId: wish.productId.userId._id}).select("address userId namaToko profile_pict").populate({path: 'address', select: "regency"});
                        break;
                    case "supplier":
                        detailToko = await TokoSupplier.findOne({userId: wish.productId.userId._id}).select("address userId namaToko profile_pict").populate({path: 'address', select: "regency"});
                        break;
                    default:
                        detailToko = await TokoVendor.findOne({userId: wish.productId.userId._id}).select("address userId namaToko profile_pict").populate({path: 'address', select: "regency"});
                        break;
                };
                return {
                    ...wish,
                    terjual: terjual ? terjual.track.reduce((acc, val)=> acc + val.soldAtMoment, 0) : 0,
                    toko: detailToko,
                    wishlisted: true
                }
            }))
            return res.status(200).json({data})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    addWishlist: async(req, res, next) => {
        try {
            const { productId } = req.body;
            if(!productId) return res.status(400).json({message: "Kirimkan productId"});
            const added = await Wishlist.exists({userId: req.user.id, productId})
            if(added){
                Wishlist.findByIdAndDelete(add._id)
                .then(()=> console.log("berhasil un-wishlist product"))
                return res.status(201).json({message: "Berhasil menghapus produk dari wishlist"})
            }
            const prod = await Product.exists({_id: productId});
            if(!prod) return res.status(404).json({message: "Produk tidak ditemukan"})
            const wishlist = await Wishlist.create({
                userId: req.user.id,
                productId
            });
            return res.status(201).json({message: "Berhasil menambahkan produk ke dalam wishlist", data: wishlist})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    deleteWishlist: async(req, res, next) => {
        try {
            const { wishlistId } = req.body;
            if(!wishlistId) return res.status(400).json({message: "Kirimkan wishlistId"});
            const wishlist = Wishlist.findByIdAndDelete(wishlistId)
            if(!wishlist) return res.status(404).json({message: "Wishlist tidak ditemukan"})
            return res.status(201).json({message: "Berhasil produk dari wishlist", data: wishlist})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}