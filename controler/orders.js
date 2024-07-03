const Orders = require("../models/model-orders")
const Product = require('../models/model-product')
const Carts = require('../models/model-cart')
const DetailPesanan = require('../models/model-detail-pesanan');
const VaUser = require("../models/model-user-va");
const VA = require("../models/model-virtual-account")
const VA_Used = require("../models/model-va-used");
const {Transaksi, Transaksi2} = require("../models/model-transaksi")
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const TokoVendor = require('../models/vendor/model-toko');
const User = require("../models/model-auth-user");
const Pengiriman = require("../models/model-pengiriman");
const Invoice = require("../models/model-invoice");
dotenv.config();

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

module.exports = {
    getOrderPanel: async (req, res, next) => {
        try {
            const datas = await Orders.find()
                .populate({
                    path: 'product.productId',
                    populate: {
                        path: 'categoryId',
                    },
                    populate: {
                        path: 'userId',
                        select: '-password'
                    },
                })
                .populate('userId', '-password').populate('addressId')

            res.status(200).json({
                message: "Success get data orders",
                datas
            });
        } catch (error) {
            console.log(error)
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

    getOrders: async (req, res, next) => {
        try {
            const { status } = req.query
            let dataOrders;
            if (req.user.role === 'konsumen') {
                const filter = { 
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    ...(status && { status })
                }
                const dataOrders = await Orders.aggregate([
                    { $match: filter },
                    { $project: { items: 1, status: 1, createdAt: 1, expire: 1 }},
                    {
                        $lookup: {
                            from: 'detailpesanans',
                            let: { orderId: '$_id' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$id_pesanan', '$$orderId'] } } },
                                { $project: { _id: 1, total_price: 1 } }
                            ],
                            as: 'detail_pesanan'
                        }
                    },
                    { $unwind: "$detail_pesanan" },
                    { $addFields: { total_pesanan: "$detail_pesanan.total_price" }},
                    { $unwind: "$items" },
                    { $unwind: "$items.product" },
                    {
                        $lookup: {
                            from: 'products',
                            let: { productIds: '$items.product.productId' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$_id', '$$productIds'] } } },
                                { $project: { _id: 1, name_product: 1, image_product: 1, categoryId: 1, userId: 1, total_price: 1 } }
                            ],
                            as: 'productInfo'
                        }
                    },
                    { $unwind: "$productInfo" },
                    { $addFields: { 'items.product.productId': "$productInfo" }},
                    {
                        $lookup: {
                            from: "users",
                            let: { userId: { $toObjectId: "$items.product.productId.userId" } },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                                { $project: { _id: 1, role: 1 } }
                            ],
                            as: "user_details"
                        }
                    },
                    { $unwind: "$user_details" },
                    { $addFields: { 'items.product.productId.userId': "$user_details" }},
                    {
                        $lookup: {
                            from: "specificcategories",
                            localField: "items.product.productId.categoryId",
                            foreignField: "_id",
                            as: "category_details"
                        }
                    },
                    { $unwind: "$category_details" },
                    { $addFields: { 'items.product.productId.categoryId': "$category_details" }},
                    { $project: { user_details: 0, productInfo: 0, category_details: 0 }},
                    {
                        $group: {
                            _id: "$_id",
                            items: {
                                $push: {
                                    product: "$items.product",
                                    deadline: "$items.deadline",
                                    kode_pesanan: "$items.kode_pesanan"
                                }
                            },
                            status: { $first: "$status" },
                            expire: { $first: "$expire" },
                            createdAt: { $first: "$createdAt" },
                            total_pesanan: { $first: "$total_pesanan" },
                        }
                    },
                ]);
                let data = []
                for(const order of dataOrders){
                    const store  = {}
                    for (const item of order.items){
                        const storeId = item.product.productId.userId._id.toString()

                        let detailToko;
                        
                        switch(item.product.productId.userId.role){
                            case "vendor":
                                detailToko = await TokoVendor.findOne({userId: storeId}).select('namaToko');
                                break;
                            case "supplier":
                                detailToko = await Supplier.findOne({userId: storeId});
                                break;
                            case "produsen":
                                detailToko = await Produsen.findOne({userId: storeId});
                                break;
                        }

                        if(!store[storeId]){
                            store[storeId] = {
                                seller : {
                                    _id: item.product.productId.userId._id,
                                    namaToko: detailToko.namaToko
                                },
                                arrayProduct: []
                            }
                        }
                        let detailBerlangsung;
                        if(order.status === "Berlangsung"){
                            const pengiriman = await Pengiriman.findOne({ productToDelivers: { $elemMatch: { productId: item.product.productId._id }}});
                            console.log(pengiriman)
                            detailBerlangsung = pengiriman? "Dikirim" : "Diproses"
                        }else if(order.status === "Belum Bayar"){
                            detailBerlangsung = null
                        }
                        store[storeId].arrayProduct.push({ ...item.product, detailBerlangsung })
                    }
                    const mappedOrder = Object.keys(store).map(key => {
                        return store[key]
                    })
                    const { items, ...rest } = order
                    data.push({
                        ...rest,
                        product_order: mappedOrder,
                    })
                }
                if (!dataOrders || dataOrders.length < 1) {
                    return res.status(200).json({ message: `anda belom memiliki ${req.user.role === "konsumen" ? "order" : "orderan"}` })
                }
                return res.status(200).json({ message: 'get data all Order success', data })
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
                        // populate: {
                        //     path: 'categoryId',
                        // },
                        // populate: {
                        //     path: 'userId',
                        // },
                    })
                    .populate('userId', '-password').populate('addressId')

                dataOrders = dataOrders.filter(order => {
                    return order.product.some(item => item.productId.userId._id.toString() === req.user.id);
                });
                if (!dataOrders || dataOrders.length < 1) {
                    return res.status(200).json({ message: `anda belom memiliki ${req.user.role === "konsumen" ? "order" : "orderan"}` })
                }
                // datas: dataOrders,
                return res.status(200).json({ message: 'get data all Order success', data })
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

    getOrderDetail: async (req, res, next) => {
        try {
            const dataOrder = await Orders.findOne({ _id: req.params.id, userId: req.user.id}).lean()
            if(!dataOrder) return res.status(404).json({message: `Tidak ada pesanan dengan id: ${req.params.id}`})
            const detail_transaksi = await Transaksi.findOne({id_pesanan: dataOrder._id})
            const detail_invoice = await Invoice.findOne({id_transaksi: detail_transaksi._id})
            return res.status(200).json({ message: 'get detail data order success', datas: { ...dataOrder, detail_invoice, detail_transaksi} });
        } catch (error) {
            console.error('Error fetching order:', error);
            next(error);
        }
    },

    createOrder: async (req, res, next) => {
        try {
            const {
                metode_pembayaran,
                total,
                items,
                shipments,
                dp,
                biaya_asuransi,
                biaya_jasa_aplikasi,
                biaya_layanan,
                poin_terpakai
            } = req.body
            console.log(JSON.stringify(req.body))
            if (Object.keys(req.body).length === 0) return res.status(400).json({ message: "Request Body tidak boleh kosong!" });
            if (!req.body["items"]) return res.status(404).json({message: "Tidak ada data items yang dikirimkan, tolong kirimkan data items yang akan dipesan"})
            if (!Array.isArray(req.body['items'])) return res.status(400).json({message: "Body items bukan array, kirimkan array"})
            
            const total_pesanan = await Orders.estimatedDocumentCount({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });

            const user = await User.findById(req.user.id)
            
            items.forEach((item, index) => {
                item.kode_pesanan = `PSN_${user.get('kode_role')}_${date}_${minutes}_${total_pesanan + index + 1}`;
            });

            const productIds = items.flatMap(item => 
                item.product.map(prod => prod.productId)
            );
                        
            const products = await Product.find({_id: { $in: productIds }}).select('_id')
            for( const prod of productIds ){
                const found = products.some(item => item._id === prod );
                if(!found) return res.status(404).json({message: `Produk dengan id ${prod} tidak ditemukan`})
            }
            
            if(items.length !== shipments.length) return res.status(400).json({message: "Data Toko tidak sama dengan dengan data pengiriman"})
            
            let va_user;
            let VirtualAccount;
            let idPay;
            let nama;

            const splitted = metode_pembayaran.split(" / ");
            if(splitted[1].replace(/\u00A0/g, ' ') == "Virtual Account"){
                va_user = await VaUser.findOne({
                    nama_bank: splitted[0],
                    userId: req.user.id
                }).populate('nama_bank')
                VirtualAccount = await VA.findById(splitted[0]);
                if(!va_user) return res.status(404).json({ message: "User belum memiliki virtual account " + VirtualAccount.nama_bank });
                idPay = va_user.nama_bank._id,
                nama = va_user.nama_virtual_account
            } else {
                paymentNumber = "123"
            }

            const va_used = await VA_Used.findOne({
                nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
                userId: req.user.id
            })

            if(va_used) return res.status(403).json({message: "Sedang ada transaki dengan virtual account ini", data: va_used});
            const decimalPattern = /^\d+\.\d+$/;
            if(decimalPattern.test(total)) return res.status(400).json({message: `Total yang dikirimkan tidak boleh decimal. ${total}`})
            const idPesanan = new mongoose.Types.ObjectId()

            const grossAmount = () => {
                if (dp.isUsed && poin_terpakai) {
                    return (dp.value * total) - poin_terpakai;
                } else if (dp.isUsed) {
                    return dp.value * total;
                } else {
                    return total;
                }
            };


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
                        order_id: idPesanan,
                        gross_amount: grossAmount()
                    },
                    bank_transfer:{
                        bank: 'bca',
                        va_number: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1]
                    },
                })
            };
                      
            const respon = await fetch(`${process.env.MIDTRANS_URL}/charge`, options);
            const transaksi = await respon.json();
            
            const a_day_later = new Date(today.getTime() + 24 * 60 * 60 * 1000)

            const dataOrder = await Orders.create({
                ...req.body,
                userId: req.user.id,
                date_order: date,
                biaya_asuransi: biaya_asuransi ? true : false,
                expire: a_day_later
            });

            const detailPesanan = await DetailPesanan.create({
                _id: idPesanan,
                id_pesanan: dataOrder._id,
                total_price: total,
                jumlah_dp: total * dp.value,
                id_va: metode_pembayaran.includes("Virtual Account") ? idPay : null,
                id_fintech: metode_pembayaran.includes("Fintech") ? idPay : null,
                id_gerai_tunai: metode_pembayaran.includes("Gerai") ? idPay : null,
                id_ewallet: metode_pembayaran.includes("E-Wallet") ? idPay : null,
                biaya_jasa_aplikasi,
                biaya_layanan,
                biaya_asuransi
            });

            await VA_Used.create({
                userId: req.user.id,
                orderId: detailPesanan._id,
                nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1]
            })
            
            const total_transaksi = await Transaksi.estimatedDocumentCount({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });

            const kode_transaksi = await Transaksi.create({
                id_pesanan: dataOrder._id,
                jenis_transaksi: "keluar",
                status: "Menunggu Pembayaran",
                kode_transaksi: `TRX_${user.get('kode_role')}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`
            })

            await Invoice.create({
                id_transaksi: kode_transaksi,
                userId: req.user.id,
                status: "Belum Lunas",
                kode_invoice: `INV_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
            })

            return res.status(201).json({ 
                message: `Berhasil membuat Pesanan dengan Pembayaran ${splitted[1]}`, 
                datas: dataOrder, 
                nama, 
                paymentNumber: transaksi.va_numbers[0].va_number, 
                total_tagihan: detailPesanan.total_price, 
                transaksi: {
                    waktu: transaksi.transaction_time,
                    orderId: transaksi.order_id
                }
            });

        } catch (error) {
            console.log(error)
            if (error && error.name == "ValidationError") {
                return res.status(400).json({
                  error: true,
                  message: error.message,
                  fields: error.fields,
                });
            }
            next(error)
        }
    },

    update_status: async (req, res, next) => {
        try {
            if (!req.body.pesananId || !req.body.status) return res.status(401).json({ message: `Dibutuhkan payload dengan nama pesananId dan status` })
            if( req.body.status !== 'berhasil') return res.status(400).json({message: "Status yang dikirimkan tidak valid"})
            const pesanan = await Orders.findById(req.body.pesananId).lean()
            const productIds = []
            const ships = []
            pesanan.items.map(item => productIds.push(item.product));
            pesanan.shipments.map(item => ships.push(item))
            if (!pesanan) return res.status(404).json({ message: `pesanan dengan id: ${req.body.pesananID} tidak ditemukan` })
            if (pesanan.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa mengubah data orang lain!" })
            const total_transaksi = await Transaksi.estimatedDocumentCount({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });
            const writeDb = [
                Orders.updateOne({_id: pesanan._id}, { status: req.body.status }),
            ]
            const finalProduct = productIds.map(item => {
                return item[0].productId
            })
            for (const item of finalProduct) {
                const product = await Product.findById(item);
                const user_seller = await User.findById(product.userId);
                if (user_seller) {
                    writeDb.push(
                        Transaksi.create({
                            id_pesanan: pesanan._id,
                            jenis_transaksi: "masuk",
                            status: "Pembayaran Berhasil",
                            kode_transaksi: `TRX_${user_seller.kode_role}_IN_SYS_${date}_${minutes}_${total_transaksi + 1}`
                        }),
                        Transaksi.create({
                            id_pesanan: pesanan._id,
                            jenis_transaksi: "keluar",
                            status: "Pembayaran Berhasil",
                            kode_transaksi: `TRX_SYS_OUT_${user_seller.kode_role}_${date}_${minutes}_${total_transaksi + 1}`
                        }),
                    );
                }
            }
            
            for (const item of ships) {
                const user_distributor = await User.findById(item.id_distributor);
                if (user_distributor) {
                    writeDb.push(
                        Transaksi.create({
                            id_pesanan: pesanan._id,
                            jenis_transaksi: "masuk",
                            status: "Pembayaran Berhasil",
                            kode_transaksi: `TRX_${user_distributor.kode_role}_IN_SYS_${date}_${minutes}_${total_transaksi + 1}`
                        }),
                        Transaksi.create({
                            id_pesanan: pesanan._id,
                            jenis_transaksi: "keluar",
                            status: "Pembayaran Berhasil",
                            kode_transaksi: `TRX_SYS_OUT_${user_distributor.kode_role}_${date}_${minutes}_${total_transaksi + 1}`
                        }),
                    );
                }
            }

            writeDb.push(
                Transaksi2.create({
                    jumlah: 20000,
                    jenis_transaksi: "bagian perusahaan",
                    status: "Pembayaran Berhasil",
                    kode_transaksi: `TRX_SYS_OUT_PRH_${date}_${minutes}_${total_transaksi + 1}`
                }),
                Transaksi2.create({
                    jumlah: 20000,
                    jenis_transaksi: "bagian perusahaan",
                    status: "Pembayaran Berhasil",
                    kode_transaksi: `TRX_PRH_IN_SYS_${date}_${minutes}_${total_transaksi + 1}`
                }),
            )
            
            await Promise.all(writeDb)
            return res.status(200).json({ message: "Berhasil Merubah Status" })
        } catch (err) {
            console.log(err)
            next(err)
        }
    },

    deleteOrder: async (req, res, next) => {
        try {
            const dataOrder = await Orders.findOne({ _id: req.params.id })
            if (dataOrder.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa menghapus data orang lain!" })

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