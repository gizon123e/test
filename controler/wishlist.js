const Wishlist = require("../models/model-wishlist");
const Product = require("../models/model-product");

module.exports = {
    addWishlist: async(req, res, next) => {
        try {
            const { productId } = req.body;
            if(!productId) return res.status(400).json({message: "Kirimkan productId"});
            const added = await Wishlist.exists({userId: req.user.id, productId})
            if(added) return res.status(403).json({message: "Produk ini sudah ditambahkan ke wishlist"})
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