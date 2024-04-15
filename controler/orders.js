const Orders = require('../models/models-orders')
const Product = require('../models/model-product')
const Carts = require('../models/model-cart')

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

            } else if (req.user.role === 'produsen' || req.user.role === 'supplier') {
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
            if (!dataOrders) {
                return res.status(200).json({ message: 'anda belom memiliki order' })
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

                    total_price += dataCart.total_price

                    const data = {
                        productId: dataCart.productId,
                        quantity: dataCart.quantity
                    }
                    dataArrayProduct.push(data);

                    await Carts.deleteOne({ _id: element })
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
                    console.log(dataArrayProduct)
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

    deleteOrder: async (req, res, next) => {
        try {
            const dataOrder = await Orders.findOne({ _id: req.params.id })

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