const Orders = require('../models/models-orders')
const Product = require('../models/model-product')
const Carts = require('../models/model-cart')
const Report = require("../models/model-laporan-penjualan");

module.exports = {

    getOrders: async (req, res, next) => {
        try {
            let dataOrders;
            if (req.user.role === 'konsumen') {
                dataOrders = await Orders.find({ userId: req.user.id })
                    .populate({
                        path: 'product.productId',
                        populate: {
                            path: 'categoryId'
                        }
                    })
                    .populate('userId', '-password').populate('addressId')

            } else if (req.user.role === 'produsen' || req.user.role === 'supplier' || req.user.role === 'vendor') {
                dataOrders = await Orders.find()
                    .populate({
                        path: 'product.productId',
                        populate: [
                            { path: 'categoryId' },
                            {
                                path: 'userId',
                                select: '-password'
                            }
                        ]
                    })
                    .populate('userId', '-password').populate('addressId')

                dataOrders = dataOrders.filter(order => {
                    return order.product.some(item => item.productId.userId._id.toString() === req.user.id);
                });
            }

            if (!dataOrders || dataOrders.length < 1) {
                return res.status(200).json({ message: `anda belom memiliki ${ req.user.role === "konsumen" ? "order" : "orderan" }` })
            }

            return res.status(200).json({ message: 'get data all Order success', datas: dataOrders })
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

    getOrderDetail: async (req, res, next) => {
        try {
            const dataOrder = await Orders.findOne({ _id: req.params.id })
                .populate({
                    path: 'product.productId',
                    populate: [
                        { path: 'categoryId' },
                        {
                            path: 'userId',
                            select: '-password'
                        }
                    ]
                })
                .populate('userId', '-password').populate('addressId')

            if (!dataOrder) return res.status(404).json({ error: 'data not found' })

            return res.status(200).json({ message: 'get detail data order success', datas: dataOrder })
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

    createOrder: async (req, res, next) => {
        try {
            const { product = [], addressId, cartId = [] } = req.body

            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const date_order = `${dd}/${mm}/${yyyy}`;

            const dataArrayProduct = []
            let total_price = 0

            if (cartId.length !== 0) {
                for (const element of cartId) {
                    const dataCart = await Carts.findOne({ _id: element })

                    if(dataCart){
                        total_price += dataCart.total_price

                        const data = {
                            productId: dataCart.productId,
                            quantity: dataCart.quantity
                        }

                        dataArrayProduct.push(data);

                        await Carts.deleteOne({ _id: element })
                    }else{
                        return res.status(404).json({message: `Cart dengan Id ${element} tidak ditemukan`})
                    }
                }
            } else if (product.length > 0) {
                for (const element of product) {
                    const dataTotalProduct = await Product.findOne({ _id: element.productId });
                    if (!dataTotalProduct) {
                        return res.status(404).json({ error: true, message: `Product with ID ${element.productId} not found` });
                    }

                    total_price = dataTotalProduct.total_price * element.quantity;

                    const data = {
                        productId: element.productId,
                        quantity: element.quantity
                    }

                    dataArrayProduct.push(data)
                }
            }

            if (dataArrayProduct.length > 0) {
                const dataOrder = await Orders.create({
                    product: dataArrayProduct,
                    addressId,
                    userId: req.user.id,
                    date_order,
                    total_price
                });

                for (const produk of dataArrayProduct){

                    const laporan = await Report.findOne({product_id: produk.productId})
                    if(!laporan){
                        const report = await Report.create({
                            product_id: produk.productId,
                            track: [ { time: new Date(), soldAtMoment: produk.quantity } ]
                        })
                    }else{
                        const noww = new Date()
                        let isDateFound = false;

                        for (const item of laporan.track) {
                            if (item.time.getDate() === noww.getDate() && 
                                item.time.getMonth() === noww.getMonth() &&
                                item.time.getFullYear() === noww.getFullYear()) {
                                item.soldAtMoment += produk.quantity;
                                isDateFound = true;
                                break;
                            }
                        }

                        if (!isDateFound) {
                            console.log('a');
                            laporan.track.push({ time: noww, soldAtMoment: produk.quantity });
                        }

                        await laporan.save()
                    }
                }
                
                return res.status(201).json({ message: 'Create order(s) success', datas: dataOrder });
            } else {
                return res.status(400).json({ message: 'data create tidak valid' })
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

    update_status: async(req, res, next) =>{
        try {
            if(!req.body.pesananID || !req.body.status) return res.status(401).json({message:`Dibutuhkan payload dengan nama pesananID dan status`})
            
            const pesanan = await Orders.findByIdAndUpdate(req.body.pesananID, {status: req.body.status},{new:true})
            
            if (pesanan.userId.toString() !== req.user.id) return res.status(403).json({message:"Tidak bisa mengubah data orang lain!"})
            
            if(!pesanan) return res.status(404).json({message:`pesanan dengan id: ${req.body.pesananID} tidak ditemukan`})
            
            return res.status(200).json({datas:pesanan})
        } catch (err) {
            console.log(err)
            next(err)
        }
    },

    deleteOrder: async (req, res, next) => {
        try {
            const dataOrder = await Orders.findOne({ _id: req.params.id })
            if (dataOrder.userId.toString() !== req.user.id) return res.status(403).json({message:"Tidak bisa menghapus data orang lain!"})
           
            if (!dataOrder) return res.status(404).json({ error: 'darta order not Found' })

            await Orders.deleteOne({ _id: req.params.id })

            return res.status(200).json({ message: 'delete data Order success' })
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