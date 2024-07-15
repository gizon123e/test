const dotenv = require('dotenv');
const fetch = require('node-fetch');
const DetailPesanan = require('../models/model-detail-pesanan');
const Pengiriman = require("../models/model-pengiriman")
const Pesanan = require('../models/model-orders');
const User = require('../models/model-auth-user')
const VA_Used = require('../models/model-va-used');
const { Transaksi } = require('../models/model-transaksi');
const Invoice = require('../models/model-invoice');
const Pembatalan = require('../models/model-pembatalan');
const Product = require('../models/model-product');
const { promises } = require('nodemailer/lib/xoauth2');
dotenv.config();

module.exports = {
    statusPayment: async (req, res, next) => {
        try {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'Authorization': `Basic ${btoa(process.env.SERVERKEY + ':')}`
                },
            };
            const respon = await fetch(`${process.env.MIDTRANS_URL}/${req.params.id}/status`, options);
            const finalResult = await respon.json()
            console.log(finalResult)
            return res.status(200).json({ message: `Status Transaksi Ini ${finalResult.transaction_status}` })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    midtransWebHook: async (req, res, next) => {
        try {
            const { order_id, transaction_status } = req.body;
            const detailPesanan = await DetailPesanan.findById(order_id);
            let pesanan;
            let user;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();

            const hh = String(today.getHours()).padStart(2, '0');
            const mn = String(today.getMinutes()).padStart(2, '0');
            const ss = String(today.getSeconds()).padStart(2, '0');
            const date = `${yyyy}${mm}${dd}`;
            const minutes = `${hh}${mn}${ss}`
            const promisesFunct = []
            if (transaction_status === "settlement") {
                pesanan = await Pesanan.findById(detailPesanan.id_pesanan).lean();
                const { items, ...restOfOrder } = pesanan;
                for( const item of items ){
                    let { product, ...restOfItem } = item;
                    const prods = []
                    for ( let prod of product ){
                        let { productId, dataProduct, ...restOfProd } = prod
                        const produk = await Product.findById(productId).populate({ path: "userId", select: "_id role" }).populate('categoryId').lean()
                        promisesFunct.push(
                            Product.updateOne(
                                { _id: productId },
                                { $inc: { total_stok: -prod.quantity } }
                            )
                        )
                        dataProduct = produk
                        prods.push({
                            productId,
                            dataProduct,
                            ...restOfProd
                        })
                    }
                    item.product = prods
                }

                promisesFunct.push(
                    Pesanan.updateOne({_id: detailPesanan.id_pesanan}, {
                        status: "Berlangsung",
                        items
                    })
                )

                if (pesanan.poinTerpakai) {
                    user = await User.findByIdAndUpdate(pesanan.userId, {
                        $inc: { poin: -pesanan.poinTerpakai }
                    });
                } else {
                    user = await User.findById(pesanan.userId)
                }
                const transaksi = await Transaksi.findOneAndUpdate({ id_pesanan: pesanan._id }, { status: "Pembayaran Berhasil" })
                promisesFunct.push (
                    VA_Used.findOneAndDelete({ orderId: order_id }),
                    DetailPesanan.findByIdAndUpdate(order_id, {
                        isTerbayarkan: true
                    }),
                    Invoice.updateOne({ id_transaksi: transaksi._id }, { status: "Lunas" })
                )

                const total_transaksi = await Transaksi.estimatedDocumentCount({
                    createdAt: {
                        $gte: now,
                        $lt: tomorrow
                    }
                });

                promisesFunct.push(
                    Transaksi.create({
                        id_pesanan: pesanan._id,
                        jenis_transaksi: "masuk",
                        status: "Pembayaran Berhasil",
                        kode_transaksi: `TRX_SYS_IN_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
                    })
                )

                await Promise.all(promisesFunct)
            } else if (transaction_status === "cancel") {
                await Pesanan.findByIdAndUpdate(detailPesanan.id_pesanan, {
                    status: "Dibatalkan"
                });
            }

            return res.status(200).json({ message: "Mantap" })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}