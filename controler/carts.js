const Carts = require('../models/model-cart')
const Product = require('../models/model-product');
const Supplier = require("../models/supplier/model-supplier");
const Produsen = require("../models/produsen/model-produsen")
const TokoVendor = require('../models/vendor/model-toko');

module.exports = {

    getCarts: async (req, res, next) => {
        try {
            const dataCart = await Carts.find({ userId: req.user.id }).populate({
                path: "productId",
                select: 'image_product _id total_price total_stok userId diskon name_product minimalOrder berat panjang lebar tinggi status',
                populate: {
                    path: "userId",
                    select: "_id role"
                }
            }).lean().sort({
                updatedAt: -1,
                createdAt: -1 
            })

            const storeMap = {};
            for(let cart of dataCart){
                const storeId = cart.productDeleted ? cart.productTerhapus.userId._id : cart.productId.userId._id
                if(!storeMap[storeId]){
                    storeMap[storeId] = {
                        id: storeId,
                        role: cart.productDeleted ? cart.productTerhapus.userId.role : cart.productId.userId.role,
                        arrayProduct: []
                    }
                }

                const tersedia = {
                    value: true,
                    message: null
                }

                if(cart.productDeleted){
                    tersedia.value = false;
                    tersedia.message = "Produk sudah dihapus"
                }else if(cart.productId.total_stok === 0){
                    tersedia.value = false;
                    tersedia.message = "Produk tidak tersedia"
                }else if(cart.productId.total_stok < cart.productId.minimalOrder){
                    tersedia.value = false;
                    tersedia.message = "Stok produk tidak mencukupi minimal pemesanan"
                }else if (cart.productId.status.value !== 'terpublish'){
                    switch(cart.productId.status.value){
                        case "ditinjau":
                            tersedia.value = false
                            tersedia.message = "Product Sedang ditinjau"
                            break;
                        case "diarsipkan":
                            tersedia.value = false
                            tersedia.message = "Product tidak tersedia"
                            break;
                    }
                }
                
                storeMap[storeId].arrayProduct.push({
                    ...(cart.productDeleted ? cart.productTerhapus : cart.productId), 
                    quantity: cart.quantity, 
                    cartId: cart._id, 
                    varian: cart.varian.length > 0? cart.varian : null, 
                    total_price_cart: cart.total_price,
                    tersedia
                });
            }
            const finalData = []
            const keys = Object.keys(storeMap)
            for (let key of keys){
                let detailToko;
                switch(storeMap[key].role){
                    case "vendor":
                        detailToko = await TokoVendor.findOne({userId: storeMap[key].id}).select('namaToko userId');
                        break;
                    case "supplier":
                        detailToko = await Supplier.findOne({userId: storeMap[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                    case "produsen":
                        detailToko = await Produsen.findOne({userId: storeMap[key].id}).select('nama namaBadanUsaha -_id');
                        break;
                }
                finalData.push({
                    nama_toko: detailToko.namaToko,
                    userId: detailToko.userId,
                    products: storeMap[key].arrayProduct
                })
            }

            if(!dataCart || dataCart.length == 0) return res.status(404).json({message:"User belum memiliki cart"});

            return res.status(200).json({ message: "Berhasil menampilkan keranjang user", datas: finalData });
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
                select: '_id name_product price  total_price diskon minimalOrder image_product userId total_stok pemasok rating minimalOrder isFlashSale panjang lebar tinggi berat',
                populate: {
                    path: 'userId',
                    select: "_id role"
                }
            })

            // const carts = await Carts.aggregate([
            //     {
            //         $match:{
            //             _id: { $in: cartIds.map(item => { return new mongoose.Types.ObjectId(item) }) }
            //         }
            //     },
            //     {
            //         $lookup:{
            //             from: "products",
            //             let: {prodId: "$productId"},
            //             pipeline: [
            //                 { 
            //                     $match:{
            //                         $expr:{
            //                             $eq: ['$_id', "$$prodId"]
            //                         }
            //                     }
            //                 },
            //                 {
            //                     $project:{
            //                         _id: 1, name_product: 1, price: 1,  total_price: 1, diskon: 1, image_product: 1, userId: 1, total_stok: 1, pemasok: 1, rating: 1, minimalOrder:1, isFlashSale: 1, varian: 1
            //                     }
            //                 }
            //             ],
            //             as: "productDatas"
            //         }
            //     },
            //     {
            //         $unwind: "$productDatas"
            //     },
            //     {
            //         $addFields: {
            //             productId: "$productDatas"
            //         }
            //     },
            //     {
            //         $project:{
            //             productDatas: 0
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: 'users',
            //             let: { userId: "$productId.userId"},
            //             pipeline: [
            //                 {
            //                     $match: {
            //                         $expr: {
            //                             $eq: ["$_id", "$$userId"]
            //                         }
            //                     }
            //                 },
            //                 {
            //                     $project: {
            //                         _id: 1, role: 1
            //                     }
            //                 }
            //             ],
            //             as: "user"
            //         }
            //     },
            //     {
            //         $unwind: "$user"
            //     },
            //     {
            //         $addFields: {
            //             'productId.userId': "$user"
            //         }
            //     },
            //     {
            //         $project:{ user: 0 }
            //     }
            // ])
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
                    varian: keranjang.varian,
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
                        detailToko = await TokoVendor.findOne({userId: store[key].id});
                        break;
                    case "supplier":
                        detailToko = await Supplier.findOne({userId: store[key].id});
                        break;
                    case "produsen":
                        detailToko = await Produsen.findOne({userId: store[key].id});
                        break;
                }
                finalData.push({
                    nama_toko: detailToko.namaToko,
                    id_user_seller: detailToko.userId,
                    id_seller: detailToko._id,
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
            const { productId, quantity, varian } = req.body
            const product = await Product.findById(productId).populate({path: "userId", select: "role"});
            if (!product) {
                return res.status(404).json({
                    error: true,
                    message: 'product id not found'
                })
            }

            if(varian && product.varian === null) return res.status(400).json({message: `Product ${product.name_product} tidak memiliki varian`});

            if(product.total_stok === 0) return res.status(403).json({message: "Tidak Bisa Menambahkan Produk stok kosong ke keranjang"});

            let accepted;
            
            switch(req.user.role){
                case "konsumen":
                    accepted = "vendor";
                    break;
                case "vendor":
                    accepted = "supplier";
                    break;
                case "supplier":
                    accepted = 'produsen';
                    break;
            }

            if(accepted !== product.userId.role) return res.status(403).json({message: "Permintaan tidak valid"});

            if(!Array.isArray(varian) && product.bervarian)return res.status(400).json({message: "Varian yang dikirimkan bukan array"});
            let harga_varian = 0
            if (varian) {
                const nama_varians = product.varian.map(item => item.nama_varian.toLowerCase());
                const nilai_varians = product.varian.flatMap(item => item.nilai_varian.map(nilai => nilai.nama.toLowerCase()));


                varian.forEach( item => {
                    harga_varian += parseInt(item.harga)
                    if (!nama_varians.includes(item.nama_varian.toLowerCase()) || !nilai_varians.includes(item.nilai_varian.toLowerCase())) {
                        return res.status(400).json({
                            error: true,
                            message: `Invalid variant for product ${product.name_product}. ${item.nama_varian.toLowerCase(), item.nilai_varian.toLowerCase()}`
                        });
                    };
                })
            }

            const filter = { 
                productId, 
                userId: req.user.id, 
                ...((varian && varian.length > 0) && { varian: { $all: varian.map(v => ({ $elemMatch: v })) } })
            }
            const validateCart = await Carts.findOne(filter).populate('userId')
            if (validateCart) {
                
                const plusQuantity = parseInt(validateCart.quantity) + parseInt(quantity)
                if(plusQuantity > product.total_stok) return res.status(403).json({message: "Tidak bisa menambahkan quantity lebih dari stok", data: validateCart})
                const updateCart = await Carts.findByIdAndUpdate({ _id: validateCart._id },
                    {
                        quantity: plusQuantity,
                        total_price: harga_varian > 0 ? ( parseInt(product.total_price) + harga_varian ) * plusQuantity : parseInt(product.total_price) * plusQuantity
                    }, { new: true })

                return res.status(201).json({
                    message: 'create data suceess',
                    datas: updateCart
                })
            } else {
                if(quantity > product.total_stok) return res.status(403).json({message: "Tidak bisa menambahkan quantity lebih dari stok"})
                const dataCarts = await Carts.create({ 
                    productId, 
                    quantity, 
                    total_price: harga_varian > 0 ? ( parseInt(product.total_price) + harga_varian ) * quantity : parseInt(product.total_price) * quantity, 
                    userId: req.user.id,
                    varian: req.body.varian
                })

                return res.status(201).json({
                    message: 'create data cart success',
                    datas: dataCarts
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
            if (!dataCart) return res.status(404).json({ message: 'delete data cart not foud' })
            if (dataCart.userId.toString() !== req.user.id) return res.status(403).json({message: "Tidak bisa menghapus data orang lain!"})

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