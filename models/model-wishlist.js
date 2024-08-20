const mongoose  = require("mongoose");

const modelWishlist = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    productId: {
        type: String,
        ref: "Product"
    }
}, { timestamps: true });

const Wishlist = mongoose.model("Wishlist", modelWishlist);
module.exports = Wishlist