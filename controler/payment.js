const dotenv = require('dotenv');
const fetch = require('node-fetch');
const DetailPesanan = require('../models/model-detail-pesanan');
const Pengiriman = require("../models/model-pengiriman")
const Pesanan = require('../models/pesanan/model-orders');
const User = require('../models/model-auth-user')
const VA_Used = require('../models/model-va-used');
const { Transaksi, Transaksi2 } = require('../models/model-transaksi');
const Invoice = require('../models/model-invoice');
const DataProductOrder = require("../models/pesanan/model-data-product-order");
const Pembatalan = require('../models/model-pembatalan');
const Product = require('../models/model-product');
const salesReport = require('../utils/checkSalesReport');
const { default: mongoose } = require('mongoose');
const PembayaranInvoice = require('../models/model-pembayaran-invoice');
const Notifikasi = require('../models/notifikasi/notifikasi')
const DetailNotifikasi = require('../models/notifikasi/detail-notifikasi')

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
            const { order_id, transaction_status, gross_amount} = req.body;
            const detailPesanan = await DetailPesanan.findById(order_id);
            const pembayaranInvoice = await PembayaranInvoice.findById(order_id)
            if(detailPesanan){
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
                    const transaksi = await Transaksi.findOneAndUpdate({ id_pesanan: pesanan._id, subsidi: false }, { status: "Pembayaran Berhasil" })
                    const invoiceTambahan = await Invoice.exists({id_transaksi: transaksi._id})
                    const pengiriman = await Pengiriman.find({invoice: invoiceTambahan._id})

                    for(const pgr of pengiriman){
                        for(const prd of pgr.productToDelivers){
                            promisesFunct.push(
                                Product.findByIdAndUpdate(
                                    prd.productId,
                                    {
                                        $inc:{
                                            total_stok: -prd.quantity
                                        } 
                                    }
                                ),
                                salesReport(prd.productId, {
                                    time: new Date(),
                                    soldAtMoment: prd.quantity
                                })
                            )
                        }
                    }
                    const dataProd = await DataProductOrder.findOne({
                        pesananId: pesanan._id,
                    }).lean()

                    const ids = dataProd.dataProduct.map(prod =>{
                        return prod._id
                    })
                    const prodNotCopied = []

                    items.map(item=>{
                        item.product.map(prod =>{
                            if(!ids.includes(prod.productId)) prodNotCopied.push(prod.productId)
                        })
                    })
                    const arrayProduct = await Product.find({_id: {$in: prodNotCopied}}).populate({path: "userId", select: "_id role"}).populate('categoryId').lean()

                    promisesFunct.push (
                        VA_Used.findOneAndDelete({ orderId: order_id }),
                        DetailPesanan.findByIdAndUpdate(order_id, {
                            isTerbayarkan: true
                        }),
                        Invoice.updateOne({ id_transaksi: transaksi._id, status: "Belum Lunas" }, { status: "Lunas" }),
                        DataProductOrder.updateOne(
                            { _id: dataProd._id },
                            {
                            $push: {
                                dataProduct: {
                                $each: arrayProduct
                                }
                            }
                            }
                        )
                        
                    )

                    const total_transaksi = await Transaksi.estimatedDocumentCount({
                        createdAt: {
                            $gte: now,
                            $lt: tomorrow
                        }
                    });

                    const notifikasi = await Notifikasi.findOne({userId: pesanan.userId, jenis_invoice: "Non Subsidi"}).sort({createdAt: -1})
                    const detailNotifikasi = await DetailNotifikasi.create({
                        notifikasiId: notifikasi._id,
                        jenis: "Info",
                        status: "Pembayaran berhasil",
                        userId: pesanan.userId,
                        message: `${invoiceTambahan.kode_invoice} senilai Rp. ${gross_amount} telah berhasil kamu bayar, pesanan akan segera diproses`,
                        image_product: pesanan.image_product[0],
                        createdAt: new Date()
                    })

                    socket.emit('notif_pembayaran_berhasil', {
                        jenis: detailNotifikasi.jenis,
                        userId: notifikasi.userId,
                        status: detailNotifikasi.status,
                        message: detailNotifikasi.message,
                        image: detailNotifikasi.image_product,
                        tanggal: formatWaktu(detailNotifikasi.createdAt)
                    })

                    promisesFunct.push(
                        Transaksi2.create({
                            id_pesanan: pesanan._id,
                            jenis_transaksi: "masuk",
                            status: "Pembayaran Berhasil",
                            kode_transaksi: `TRX_SYS_IN_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
                        })
                    )

                    await Promise.all(promisesFunct)
                }
            }else if(pembayaranInvoice){
                const invoices = await Invoice.find({_id: {$in: pembayaranInvoice.invoiceIds}}).lean();
                const transaksiIds = invoices.map(inv => inv.id_transaksi);
                await Transaksi.updateMany(
                    { _id: { $in: transaksiIds }},
                    { status: "Pembayaran Berhasil" }
                );
                await Invoice.updateMany(
                    { _id: { $in: pembayaranInvoice.invoiceIds } },
                    { status: "Lunas" }
                );
            }

            return res.status(200).json({ message: "Mantap" })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    bayarInvoice: async(req, res, next) => {
        try {
            const { invoiceIds } = req.body

            const invoices = await Invoice.find({_id: { $in: invoiceIds }}).lean();
            const transaksi = await Transaksi.find({
                _id: {
                    $in: invoices.map(inv => inv.id_transaksi)
                }
            });
            const total_tagihan = transaksi.reduce((acc, val)=> {
                return acc + val.detailBiaya.totalHargaProduk + val.detailBiaya.jumlahOngkir + val.detailBiaya.biaya_layanan + val.detailBiaya.biaya_jasa_aplikasi
            }, 0) 
            const id_pembayaran = new mongoose.Types.ObjectId()
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Basic ${btoa(process.env.SERVERKEY + ':')}`
                },
                body: JSON.stringify({
                    payment_type: 'bank_transfer',
                    transaction_details: {
                        order_id: id_pembayaran,
                        gross_amount: total_tagihan
                    },
                    bank_transfer: {
                        bank: 'bca',
                    },
                })
            };

            
            const respon = await fetch(`${process.env.MIDTRANS_URL}/charge`, options);
            const transaksiMidtrans = await respon.json();
            await PembayaranInvoice.create({
                _id: id_pembayaran,
                invoiceIds,
                total_tagihan,
                paymentNumber: transaksiMidtrans.va_numbers[0].va_number
            })
            
            return res.status(200).json({data: transaksiMidtrans})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}