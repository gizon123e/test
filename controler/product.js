const Product = require('../models/model-product')
const User = require("../models/model-auth-user")
module.exports = {
    upload: async (req, res, next) => {
        try {
            const { name_product, price, diskon, description, image_product} = req.body
            const total_price = price - (price * diskon /100)
            const user = User.findById(req.user.id).then(async(found)=>{
                const newProduct = await Product.create({ name_product, price, diskon, description, image_product, total_price, userId:found.id})
                return res.status(201).json({
                    error: false,
                    message: 'Upload Product Success',
                    datas: newProduct
                })
            })
            
        } catch (err) {
            console.log(err)
            next(err)
        }
    },
    edit:async(req, res,next)=>{
        try{
            const productId = req.body.product_id
            const updateData = req.body
            delete updateData.product_id
            const product = await Product.findByIdAndUpdate(productId, updateData,{new: true})
            if(product){
                return res.status(201).json({
                    error: false,
                    message: "Berhasil Mengubah Data Produk",
                    datas: product
                })
            }else{
                return res.status(404).json({
                    error: true,
                    message: `Produk dengan id: ${productId} tidak ditemukan`,
                    datas: product
                })
            }
        }catch(err){
            console.log(err)
            return res.status(500).json({message: 'internal server error'})
        }
    },
    delete:async(req,res,next)=>{
        try{
            const productId = req.body.product_id
            Product.findByIdAndDelete(productId).then((prod)=>{
                return res.status(201).json({
                    error: false,
                    message: "Berhasil Menghapus Data Produk",
                    datas: prod
                })
            })
        }catch(err){
            console.log(err)
            return res.status(500).json({message: 'internal server error'})
        }
    }
}