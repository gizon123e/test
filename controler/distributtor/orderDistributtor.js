const OrderDistributtor = require('../../models/distributtor/model-order-distributtor')
const Distributtor = require('../../models/distributtor/model-distributtor')
const Order = require('../../models/models-orders')


module.exports = {
    getAllOrderDistributtor: async (req, res, next) => {
        try {
            if (req.user.role === "distributor") {
                const distributtor = await Distributtor.findOne({ userId: req.user.id })
                if (!distributtor) {
                    return res.status(404).json({ message: "distributtor not found" })
                }

                const dataDistributtor = await OrderDistributtor.find({ distributorId: distributtor._id })
                    .populate('tujuan_alamat', '-userId')
                    .populate('user_orderId', "-password")
                    .populate({
                        path: 'orderId',
                        select: '-userId -addressId -date_order -status',
                        populate: {
                            path: 'product.productId',
                            select: '-komentar -total_price"'
                        }
                    })
                    .populate({
                        path: "distributorId",
                        populate: {
                            path: "userId",
                            select: "-password"
                        }
                    })
                
                return res.status(200).json({ message: 'get all order distributtor success', datas: dataDistributtor })
            }

            const dataDistributtor = await OrderDistributtor.find({ user_orderId: req.user.id })
                .populate('tujuan_alamat', '-userId')
                .populate('user_orderId', "-password")
                .populate({
                    path: 'order_product',
                    select: '-userId -addressId -date_order -status',
                    populate: {
                        path: 'product.productId',
                        select: '-komentar -total_price"'
                    }
                })
                .populate({
                    path: "distributtorId",
                    populate: {
                        path: "userId",
                        select: "-password"
                    }
                })

            return res.status(200).json({ message: 'get all orders distributtor success', datas: dataDistributtor })
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

    createOrderDistributtor: async (req, res, next) => {
        try {
            const { distributorId, orderId } = req.body

            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const date_order = `${dd}/${mm}/${yyyy}`;

            const order = await Order.findById(orderId)
            if (!order) return res.status(404).json({ error: 'data orderId not found' })

            if (req.user.role === "distributtor") return res.status(400).json({ error: "anda tidak dapat create order distributtor" })

            const dataOrder = await OrderDistributtor.create({ distributorId, orderId, user_orderId: req.user.id, date_order, tujuan_alamat: order.addressId._id })
            console.log(dataOrder)
            res.status(201).json({ message: 'create data order distributtor success', datas: dataOrder })

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
    updateOrderDistributtor: async (req, res, next) => {
        try {
            const { status_order, estimasi_hari } = req.body

            const dataDetailOrderDistributtor = await OrderDistributtor.findOne({ _id: req.params.id })
            if (!dataDetailOrderDistributtor) return res.status(404).json({ error: `data ${req.params.id} not found` })

            if (!status_order) return res.status(400).json({ erro: 'data status_order harus di isi' })

            let dataOrder
            if (req.user.role === "distributtor") {
                if (dataDetailOrderDistributtor.status_order === 'Cancel' || dataDetailOrderDistributtor.status_order === 'Verifikasi Penerima') {

                    return res.status(400).json({ error: "anda sudah tidak dapat update status order" })

                } else {
                    if (!estimasi_hari) return res.status(400).json({ error: 'data estimasi_hari harus di isi' })
                    if (status_order === 'Verifikasi Pengiriman') {
                        dataOrder = await OrderDistributtor.findByIdAndUpdate({ _id: req.params.id }, { status_order, estimasi_hari }, { new: true })
                    } else {
                        return res.status({ error: "status order tidak valid" })
                    }
                }
            } else {
                if (dataDetailOrderDistributtor.status_order === 'Verifikasi Pengiriman') {
                    if (status_order === 'Verifikasi Penerima') {

                        dataOrder = await OrderDistributtor.findByIdAndUpdate({ _id: req.params.id }, { status_order, estimasi_hari }, { new: true })

                    } else {
                        return res.status(400).json({ error: "anda sudah tidak dapat update status order" })
                    }
                } else if (dataDetailOrderDistributtor.status_order === 'Proses') {
                    if (status_order === 'Cancel') {

                        dataOrder = await OrderDistributtor.findByIdAndUpdate({ _id: req.params.id }, { status_order, estimasi_hari }, { new: true })

                    } else {
                        return res.status(400).json({ error: "status order tidak valid" })
                    }
                } else if (dataDetailOrderDistributtor.status_order === 'Verifikasi Penerima') {
                    return res.status(400).json({ error: "anda sudah tidak dapat update status order" })
                }
            }

            res.status(201).json({ message: 'update data order distributtor', datas: dataOrder })
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

    deleteOrderDistributtor: async (req, res, next) => {
        try {
            const orderDistributtor = await OrderDistributtor.findOne({ _id: req.params.id })
            if (!orderDistributtor) return res.status(404).json({ error: `data id ${req.params.id} not found` })

            await OrderDistributtor.deleteOne({ _id: req.params.id })
            res.status(200).json({ message: `data id ${req.params.id} deleted successfully` })
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