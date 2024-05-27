const Carts = require('../models/model-cart')
const Product = require('../models/model-product');
const Supplier = require("../models/supplier/model-supplier");
const Produsen = require("../models/produsen/model-produsen")
const Vendor = require("../models/vendor/model-vendor")

module.exports = {

    getCarts: async (req, res, next) => {
        try {
            const dataCart = await Carts.find({ userId: req.user.id })
                .populate({
                    path: 'productId',
                    select: "_id categoryId name_product total_price image_product",
                    populate: {
                        path: 'userId',
                        select: '_id role'
                    }
                });
            
            const idUserToko = []
            let product;

            dataCart.forEach(item => {
                idUserToko.push({id: item.productId.userId._id, role: item.productId.userId.role})
            });
            
            idUserToko.forEach( async (item) => {
                let detailToko
                switch(item.role){
                    case "vendor": 
                        detailToko = await Vendor.findOne({userId: item.id});
                        break;
                    case "supplier":
                        detailToko = await Supplier.findOne({userId: item.id});
                        break;
                    case "produsen":
                        detailToko = await Produsen.findOne({userId: item.id});
                        break;
                };

                const filteredProduct = dataCart.filter(item => {
                    return item.productId.userId._id.toString() === detailToko.userId.toString()
                });
                console.log(filteredProduct)
            })

            if(!dataCart || dataCart.length == 0) return res.status(404).json({message:"User belum memiliki cart"});

            return res.status(200).json({ datas: dataCart })
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            };
            console.log(error)
            next(error)
        }
    },

    createCarts: async (req, res, next) => {
        try {
            const { productId, quantity } = req.body

            const vaildateProduct = await Product.findById(productId).populate('userId');
            
            if(vaildateProduct.userId.role !== "vendor") return res.status(403).json({message: "Hanya bisa menambahkan ke keranjang product dari Vendor"});

            if (!vaildateProduct) {
                return res.status(400).json({
                    error: true,
                    message: 'product id not found'
                })
            }

            if (req.user.role === 'konsumen') {
                const validateCart = await Carts.findOne({ productId }).populate('userId')

                if (validateCart) {
                    
                    const plusQuantity = parseInt(validateCart.quantity) + parseInt(quantity)

                    const updateCart = await Carts.findByIdAndUpdate({ _id: validateCart._id },
                        {
                            quantity: plusQuantity,
                            total_price: parseInt(vaildateProduct.total_price) * plusQuantity
                        }, { new: true })

                    return res.status(201).json({
                        message: 'create data suceess',
                        datas: updateCart
                    })
                } else {
                    const dataCarts = await Carts.create({ 
                        productId, 
                        quantity, 
                        total_price: parseInt(vaildateProduct.total_price) * quantity, 
                        userId: req.user.id 
                    })

                    return res.status(201).json({
                        message: 'create data cart success',
                        datas: dataCarts
                    })
                }
            } else {
                return res.status(400).json({
                    message: "kamu tidak boleh create yang hanya boleh role nya konsumen"
                })
            }


        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    },

    updateCart: async (req, res, next) => {
        try {
            const dataCharts = await Carts.findById( req.params.id ).populate('productId')
            const productId = dataCharts.productId._id
            dataCharts.total_price = parseInt(dataCharts.productId.total_price) * req.body.quantity
            dataCharts.quantity = req.body.quantity
            const object = dataCharts.toObject()
            object.productId = productId
            await dataCharts.save()
            return res.status(201).json({ message: 'update data cart success', data: object })
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    },

    deleteCarts: async (req, res, next) => {
        try {
            const dataCart = await Carts.findOne({ _id: req.params.id })
            if (dataCart.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak bisa menghapus data orang lain!"})
            if (!dataCart) return res.status(404).json({ message: 'delete data cart not foud' })

            await Carts.deleteOne({ _id: req.params.id })
            return res.status(200).json({ message: 'delete data success' })
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    }
}