const Carts = require('../models/model-cart')
const Product = require('../models/model-product');
const Supplier = require("../models/supplier/model-supplier");
const Produsen = require("../models/produsen/model-produsen")
const Vendor = require("../models/vendor/model-vendor")

module.exports = {

    getCarts: async (req, res, next) => {
        try {
            const idProducts = []
            const dataCart = await Carts.find({ userId: req.user.id })

            dataCart.forEach(element => {
                idProducts.push(element.productId)
            });
            // const sellerId = [];

            const productsChoosed = await Product.find({ _id: { $in : idProducts } }).select('image_product _id userId total_price name_product minimalOrder').populate({
                path: "userId",
                select: "_id role"
            })
            .lean();

            const storeMap = {};
              
            for (let product of productsChoosed) {
                const storeId = product.userId._id.toString(); // Pastikan _id diubah menjadi string untuk pemetaan
                const getCart = dataCart.find(cart => { return cart.productId === product._id })
                if (!storeMap[storeId]) {
                  storeMap[storeId] = {
                    id: storeId,
                    role: product.userId.role,
                    arrayProduct: []
                  };
                }
                storeMap[storeId].arrayProduct.push({...product, quantity: getCart.quantity, cartId: getCart._id});
            };
            const finalData = []
            const keys = Object.keys(storeMap)
            for (let key of keys){
                let detailToko;
                switch(storeMap[key].role){
                    case "vendor":
                        detailToko = await Vendor.findOne({userId: storeMap[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                    case "supplier":
                        detailToko = await Supplier.findOne({userId: storeMap[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                    case "produsen":
                        detailToko = await Produsen.findOne({userId: storeMap[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                }
                finalData.push({
                    nama_toko: detailToko.nama || detailToko.namaBadanUsaha,
                    products: storeMap[key].arrayProduct
                })
            }

            if(!dataCart || dataCart.length == 0) return res.status(404).json({message:"User belum memiliki cart"});

            return res.status(200).json({ datas: finalData });
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            };
            console.log(error);
            next(error);
        }
    },

    getCartsById: async(req, res, next) => {
        try {
            const { cartIds } = req.body
            const carts = await Carts.find({_id: { $in : cartIds}, userId: req.user.id}).populate({
                path: 'productId',
                select: '_id name_product price  total_price diskon image_product userId total_stok pemasok rating minimalOrder isFlashSale varian',
                populate: {
                    path: 'userId',
                    select: "_id role"
                }
            }).lean()
            const store = {}
            for (const keranjang of carts){
                // console.log(keranjang.productId.userId._id)
                const storeId = keranjang.productId.userId._id.toString();
                if(!store[storeId]){
                    store[storeId] = {
                        id: storeId,
                        role: keranjang.productId.userId.role,
                        arrayProduct: []
                    }
                }

                store[storeId].arrayProduct.push({
                    cartId: keranjang._id,
                    product: keranjang.productId,
                    quantity: keranjang.quantity
                })
            }

            const keys = Object.keys(store)
            const finalData = []
            let detailToko
            for(const key of keys){
                switch(store[key].role){
                    case "vendor":
                        detailToko = await Vendor.findOne({userId: store[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                    case "supplier":
                        detailToko = await Supplier.findOne({userId: store[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                    case "produsen":
                        detailToko = await Produsen.findOne({userId: store[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                }
                finalData.push({
                    nama_toko: detailToko.nama || detailToko.namaBadanUsaha,
                    products: store[key].arrayProduct
                })
            }
            
            return res.status(200).json({message: "Berhasil Mendapatkan Cart by Ids", data: finalData})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    createCarts: async (req, res, next) => {
        try {
            const { productId, quantity } = req.body

            const vaildateProduct = await Product.findById(productId).populate('userId');
            
            if (!vaildateProduct) {
                return res.status(404).json({
                    error: true,
                    message: 'product id not found'
                })
            }
            
            if(vaildateProduct.userId.role !== "vendor") return res.status(403).json({message: "Hanya bisa menambahkan ke keranjang product dari Vendor"});


            if (req.user.role === 'konsumen') {
                const validateCart = await Carts.findOne({ productId, userId: req.user.id }).populate('userId')

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
            const dataCharts = await Carts.findByIdAndUpdate( req.params.id, {
                $inc: { quantity: parseInt(req.body.quantity) }
            }, {new: true})
            return res.status(201).json({ message: 'update data cart success', data: dataCharts })
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
    },

    deleteAllCarts: async (req, res, next) => {
        try {
            await Carts.deleteMany({ userId: req.user.id });
            return res.status(200).json({ message: 'delete data success' });
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            };
            console.log(error);
            next(error);
        }
    },
}