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
const DetailNotifikasi = require('../models/notifikasi/detail-notifikasi');
const { io } = require("socket.io-client");
const BiayaTetap = require('../models/model-biaya-tetap');
const Distributtor = require('../models/distributor/model-distributor');
const ProsesPengirimanDistributor = require('../models/distributor/model-proses-pengiriman');
const PoinHistory = require("../models/model-poin")

dotenv.config();

const socket = io(process.env.WEBSOCKET, {
    auth: {
        fromServer: true
    }
});

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
const minutes = `${hh}${mn}${ss}`;

function formatTanggal(tanggal){
    const dd = String(tanggal.getDate()).padStart(2, '0');
    const mm = String(tanggal.getMonth() + 1).padStart(2, '0');
    const yyyy = tanggal.getFullYear();
    return `${yyyy}-${mm}-${dd}`
}

function formatWaktu(waktu){
    const hh = String(waktu.getHours()).padStart(2, '0');
    const mn = String(waktu.getMinutes()).padStart(2, '0');
    const ss = String(waktu.getSeconds()).padStart(2, '0');
    return `${hh}:${mn}:${ss}`
}

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
            const promisesFunct = []
            const biayaTetap = await BiayaTetap.findOne({}).lean()
            let total_transaksi = await Transaksi.estimatedDocumentCount({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });

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
                const sixHoursAgo = formatWaktu(new Date(new Date().getTime() + 6 * 60 * 60 * 1000));

                if (transaction_status === "settlement") {
                    pesanan = await Pesanan.findById(detailPesanan.id_pesanan).lean();
                    const { items, shipments,...restOfOrder } = pesanan;

                    promisesFunct.push(
                        Pesanan.updateOne({_id: detailPesanan.id_pesanan}, {
                            status: "Berlangsung",
                            items
                        })
                    );

                    user = await User.findById(pesanan.userId)

                    const transaksi = await Transaksi.findOneAndUpdate({ id_pesanan: pesanan._id, subsidi: false }, { status: "Pembayaran Berhasil" })
                    const invoiceTambahan = await Invoice.exists({id_transaksi: transaksi._id}).select('_id kode_invoice')
                    const pengiriman = await Pengiriman.find({invoice: invoiceTambahan._id})
                    .populate("id_toko")
                    .populate("productToDelivers.productId")
                    .populate("invoice")

                    for(const pgr of pengiriman){
                        const id_notif_vendor = new mongoose.Types.ObjectId()
                        const total_harga_vendor = (pgr.productToDelivers[0].productId.price * pgr.productToDelivers[0].quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                        Notifikasi.create({
                            _id: id_notif_vendor,
                            userId: pgr.id_toko.userId,
                            invoiceId: pgr.invoice,
                            jenis_invoice: "Non Subsidi",
                            createdAt: new Date()
                        })
                        .then(() => console.log("berhasil simpan notif vendor"))
                        .catch(() => console.log("Gagal simpan notif vendor"))
                       
                        DetailNotifikasi.create({
                            notifikasiId: id_notif_vendor,
                            jenis: "Pesanan",
                            status: `Ada ${pgr.productToDelivers[0].quantity} Pesanan Senilai Rp. ${total_harga_vendor}`,
                            message: `Segera terima pesanan ${pgr.invoice.kode_invoice} sebelum ${sixHoursAgo}`,
                            image_product: pgr.productToDelivers[0].productId.image_product[0],
                            createdAt: new Date()
                        })
                        .then(() => console.log("Berhasil simpan detail notif vendor"))
                        .catch((error) => console.log(error))

                        socket.emit('notif_vendor_pesanan_masuk', {
                            jenis: "Pesanan",
                            userId: pgr.id_toko.userId,
                            status: `Ada ${pgr.productToDelivers[0].quantity} Pesanan Senilai Rp. ${total_harga_vendor}`,
                            message: `Segera terima pesanan ${pgr.invoice.kode_invoice} sebelum ${sixHoursAgo}`,
                            image: pgr.productToDelivers[0].productId.image_product[0],
                            tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
                        })

                        const proses = await ProsesPengirimanDistributor.findOneAndUpdate(
                            {kode_pengiriman: pgr.kode_pengiriman},
                            {
                                $inc: {
                                    tarif_pengiriman: pgr.total_ongkir
                                }
                            },
                            {
                                new: true
                            }
                        )
                        for(const prd of pgr.productToDelivers){
                            if(proses){
                                const index = proses.produk_pengiriman.findIndex(prod => prod._id === prd._id)
                                proses.produk_pengiriman[index].quantity += prd.quantity
                                promisesFunct.push(
                                    proses.save()
                                )
                            }
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

                    if(pesanan.poinTerpakai){
                        promisesFunct.push(
                            PoinHistory.create({
                                userId: user._id,
                                jenis: "keluar",
                                value: pesanan.poinTerpakai,
                                from: dataProd.dataProduct
                            })
                        )
                    }
                    const ids = dataProd.dataProduct.map(prod =>{
                        return prod._id
                    })
                    const prodNotCopied = []
                    
                    items.map(item =>{
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
                    const notifikasi = await Notifikasi.findOne({userId: pesanan.userId, jenis_invoice: "Non Subsidi"}).sort({createdAt: -1})
                    DetailNotifikasi.create({
                        notifikasiId: notifikasi?._id,
                        jenis: "Info",
                        status: "Pembayaran berhasil",
                        message: `${invoiceTambahan.kode_invoice} senilai Rp. ${gross_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} telah berhasil kamu bayar, pesanan akan segera diproses`,
                        image_product: pengiriman[0].productToDelivers[0].productId.image_product[0],
                        createdAt: new Date()
                    })
                    .then(() => console.log("notif pembayaran berhasil"))
                    .catch(() => console.log("notif pembayaran gagal"))

                    socket.emit('notif_pembayaran_berhasil', {
                        jenis: "Info",
                        userId: notifikasi?.userId,
                        status: "Pembayaran berhasil",
                        message: `${invoiceTambahan.kode_invoice} senilai Rp. ${gross_amount} telah berhasil kamu bayar, pesanan akan segera diproses`,
                        image: pengiriman[0].productToDelivers[0].productId.image_product[0],
                        tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`
                    })

                    promisesFunct.push(
                        Transaksi2.create({
                            id_pesanan: pesanan._id,
                            jenis_transaksi: "masuk",
                            status: "Pembayaran Berhasil",
                            kode_transaksi: `TRX_SYS_IN_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`,
                            jumlah: gross_amount
                        })
                    )
                }
            }else if(pembayaranInvoice){
                const invoices = await Invoice.find({_id: {$in: pembayaranInvoice.invoiceIds}}).lean();
                const transaksiIds = invoices.map(inv => inv.id_transaksi);
                const shipments = await Pengiriman.find({invoice: { $in: pembayaranInvoice.invoiceIds }}).populate({
                    path: "invoice",
                    populate:{
                        path: "id_transaksi"
                    }
                }).lean();
                const countedSeller = new Set()
                const addedInv = new Set()

                for(const shp of shipments){
                    const dataProduct = await DataProductOrder.findOne({pesananId: shp.orderId})
                    const inv = await Invoice.findOne({_id: shp.invoice._id, status: { $ne: "Lunas"}}).populate('id_transaksi');
                    let user;
                    let total_harga_produk = 0;
                    for(prd of shp.productToDelivers){
                        const selectedProduct = dataProduct.dataProduct.find(prod => prod._id === prd.productId)
                        if(shp.isBuyerAccepted){
                            
                            total_harga_produk += selectedProduct.total_price * prd.quantity
                            
                            if(!countedSeller.has(user?._id.toString())){
                                user = await User.findById(selectedProduct.userId)
                                countedSeller.add(user._id.toString())
                            }
    
                            
                        }
                    };

                    if(shp.isBuyerAccepted){
                        const distri = await Distributtor.findById(shp.distributorId).select("userId");
                        const userDistri = await User.findById(distri.userId)
    
                        if(!addedInv.has(inv?._id.toString())){
                            promisesFunct.push(
                                Transaksi2.create({
                                    id_pesanan: shp.orderId,
                                    jenis_transaksi: "masuk",
                                    status: "Pembayaran Berhasil",
                                    kode_transaksi: `TRX_SYS_OUT_PRH_${date}_${minutes}_${total_transaksi += 1}`,
                                    jumlah: inv.id_transaksi.detailBiaya.biaya_layanan + inv.id_transaksi.detailBiaya.biaya_jasa_aplikasi
                                }),
    
                                Transaksi2.create({
                                    id_pesanan: shp.orderId,
                                    jenis_transaksi: "masuk",
                                    status: "Pembayaran Berhasil",
                                    kode_transaksi: `TRX_PRH_IN_SYS_${date}_${minutes}_${total_transaksi += 1}`,
                                    jumlah: inv.id_transaksi.detailBiaya.biaya_layanan + inv.id_transaksi.detailBiaya.biaya_jasa_aplikasi
                                })
                            )
    
                            addedInv.add(inv._id.toString())
                        }
    
                        promisesFunct.push(
    
                            Transaksi.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "masuk",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_${user.get('kode_role')}_IN_SYS_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: user._id,
                                jumlah: total_harga_produk
                            }),
    
                            Transaksi2.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "keluar",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_SYS_OUT_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: user._id,
                                jumlah: total_harga_produk
                            }),
    
                            Transaksi.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "keluar",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_${user.get('kode_role')}_OUT_PRH_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: user._id,
                                jumlah: biayaTetap.fee_vendor
                            }),
                            
                            Transaksi2.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "masuk",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_PRH_IN_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: user._id,
                                jumlah: biayaTetap.fee_vendor
                            }),
    
                            Transaksi.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "masuk",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_${userDistri.get('kode_role')}_IN_SYS_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: userDistri._id,
                                jumlah: shp.total_ongkir
                            }),
    
                            Transaksi.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "keluar",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_${userDistri.get('kode_role')}_OUT_PRH_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: userDistri._id,
                                jumlah: biayaTetap.fee_distributor
                            }),
    
                            Transaksi2.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "keluar",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_SYS_OUT_${userDistri.get('kode_role')}_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: userDistri._id,
                                jumlah: shp.total_ongkir
                            }),
    
                            Transaksi2.create({
                                id_pesanan: shp.orderId,
                                jenis_transaksi: "masuk",
                                status: "Pembayaran Berhasil",
                                kode_transaksi: `TRX_PRH_IN_${userDistri.get('kode_role')}_${date}_${minutes}_${total_transaksi += 1}`,
                                userId: userDistri._id,
                                jumlah: biayaTetap.fee_distributor
                            }),
                        )
                    }
                }

                promisesFunct.push(
                    Transaksi2.create({
                        id_pesanan: pembayaranInvoice,
                        jenis_transaksi: "masuk",
                        status: "Pembayaran Berhasil",
                        kode_transaksi: `TRX_SYS_IN_KNS_${date}_${minutes}_${total_transaksi + 1}`,
                        jumlah: gross_amount,
                        subsidi: true
                    })
                );

                await Transaksi.updateMany(
                    { _id: { $in: transaksiIds }},
                    { status: "Pembayaran Berhasil" }
                );

                await Invoice.updateMany(
                    { _id: { $in: pembayaranInvoice.invoiceIds } },
                    { status: "Lunas" }
                );
            }
            await Promise.all(promisesFunct)
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