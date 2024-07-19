const Product = require('../models/model-product')
const Comment = require('../models/model-komentar')
module.exports = {
    addComment: async (req, res, next) => {
        try {
            const { productId, comment, rating } = req.body;
            
            if(!productId || !comment || !rating) return res.status(400).json({message:`Payload yang dibutuhkan tidak ada. productId: ${productId}, comment: ${comment} rating: ${rating}`})

            const komen = await Comment.findOne({ productId, userId: req.user.id})

            if(komen) return res.status(403).json({message:"User yang sama tidak bisa memberikan komentar lebih dari satu kali"})
            
        
            if (!productId) return res.status(400).json({ message: "Diperlukan payload productId dan komentar" });
        
            const produk = await Product.findById(productId);
            if (!produk) return res.status(404).json({ message: `Produk dengan id: ${productId} tidak ditemukan` });
            
            const newComment = await Comment.create({
                productId,
                comment,
                rating,
                userId: req.user.id
            })

            return res.status(200).json({ message: "Berhasil menambahkan komentar untuk produk ini", data: newComment });
        } catch (err) {
          console.log(err);
          next(err);
        }
    },

    listComments: async ( req, res, next ) =>{
        try {
            const {productId} = req.query

            if(!productId ) return res.status(400).json({message:`Payload yang dibutuhkan tidak ada. productId: ${productId}`})

            const comments = await Comment.find({productId})

            if(!comments) return res.status(404).json({message: "Produk ini tidak memiliki komentar"})

            return res.status(200).json({
                message: "Berhasil mendapatkan semua komentar untuk produk ini",
                dataa: comments
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    replyComment: async(req, res, next) => {
        try {
            const {commentId, reply} = req.body

            if(!commentId || !reply ) return res.status(400).json({message:`Payload yang dibutuhkan tidak ada. commentId: ${commentId} reply: ${reply}`})

            const comment = await Comment.findById(commentId).populate("productId")

            if(comment.productId.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak bisa membalas komentar di produk orang lain!"})
            
            const updated = await Comment.findByIdAndUpdate(commentId,{$set:{sellerResponse: reply}}, {new:true})
            
            return res.status(200).json({message: "Berhasil membalas komentar ini", data: updated})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}