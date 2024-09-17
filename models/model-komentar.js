const mongoose = require('mongoose')
require('./model-auth-user')
require("./model-product")
const komentarModels = new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    productId:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product"
    },
    comment: {
        type: String,
        required: false
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    sellerResponse:{
        type: String,
    }
})

komentarModels.post("save", async function(next){
    try {
        const Product = mongoose.model('Product')
        const productId = this.productId

        const comments = await mongoose.model('Comment').aggregate([
            { $match: { productId: productId }},
            { 
                $group: {
                    _id: null,
                    totalRating: { $sum: "$rating" },
                    totalComments: { $sum: 1 }
                }
            },
            {
                $project:{
                    _id: 0,
                    averageRating: {
                        $divide: ["$totalRating", "$totalComments"]
                    }
                }
            }
        ]);
        const rating = comments.length > 0 ? comments[0].averageRating : 0
        await Product.findByIdAndUpdate(productId, {rating: rating.toFixed(2)})
    } catch (error) {
        console.log(error)
    }
})

const Comment = mongoose.model("Comment",komentarModels)


module.exports = Comment