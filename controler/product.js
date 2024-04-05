const Product = require('../models/model-product')
const User = require("../models/model-auth-user")
module.exports = {
    list_product: async(req, res, next) => {
        try {
            const list_product = await Product.find({userId: req.user.id})
            if(!list_product || list_product.length == 0){
                return res.status(404).json({message:`${req.user.name} tidak memiliki produk`})
            }
            return res.status(201).json({datas: list_product})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: 'internal server error'})
        }
    },
    upload: async (req, res, next) => {
        try {
            const dataProduct = req.body
            const user = User.findById(req.user.id).then(async(found)=>{
                dataProduct.userId = found.id
                const newProduct = await Product.create(dataProduct)
                return res.status(201).json({
                    error: false,
                    message: 'Upload Product Success',
                    datas: newProduct
                })
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({message: 'user tidak ditemukan'})
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