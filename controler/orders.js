const Orders = require('../models/model-orders')
const Product = require('../models/model-product')
const Carts = require('../models/model-cart')
// const Report = require("../models/model-laporan-penjualan");
const DetailPesanan = require('../models/model-detail-pesanan');
const VaUser = require("../models/model-user-va");
const VA = require("../models/model-virtual-account")
const VA_Used = require("../models/model-va-used");
const Vendor = require('../models/vendor/model-vendor');
const fetch = require('node-fetch');
// const Address = require('../models/model-address');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

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
            console.log('meluncur')
            let dataOrders;
            if (req.user.role === 'konsumen') {
                const dataOrders = await Orders.aggregate([
                    { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
                    { $project: { product: 1}},
                    {
                        $lookup: {
                            from: "detailpesanans",
                            foreignField: "id_pesanan",
                            localField: "_id",
                            as: 'detail_pesanan'
                        }
                    },
                    {
                        $addFields: {
                            "total_price": { $arrayElemAt: ["$detail_pesanan.total_price", 0] }
                        }
                    },
                    { $project: { detail_pesanan: 0 }},
                    {
                        $lookup: {
                            from: 'products',
                            let: { productIds: '$product.productId' },
                            pipeline: [
                                { $match: { $expr: { $in: ['$_id', '$$productIds'] } } },
                                { $project: { _id: 1, name_product: 1, image_product: 1, categoryId: 1, varian: 1, detail_varian: 1, userId: 1 } }
                            ],
                            as: 'productInfo'
                        }
                    },
                    {
                        $unwind: '$productInfo'
                    },
                    {
                        $lookup: {
                            from: 'specificcategories',
                            let: { cat: '$productInfo.categoryId'},
                            pipeline: [
                                { $match : { $expr: { $eq: ['$_id', "$$cat"]}}},
                                { $project: { name: 1, _id: 0 } }
                            ],
                            as: "categoryInfo"
                        }
                    },
                    {
                        $addFields: {
                            "productInfo.categoryId": { $arrayElemAt: ["$categoryInfo.name", 0] }
                        }
                    },
                    {
                        $project: { product: 0, categoryInfo: 0 }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { userId: '$productInfo.userId'},
                            pipeline:[
                                { $match: { $expr: { $eq: ["$_id", "$$userId"]}} },
                                { $project: { _id: 1, role: 1} }
                            ],
                            as: "user_details"                        
                        }
                    },
                    {
                        $addFields: {
                            "productInfo.userId": { $arrayElemAt: ["$user_details", 0] }
                        }
                    },
                    {
                        $project: { user_details: 0 }
                    }
                ]);
                let data = []
                const promises = dataOrders.map(async (order) => {
                    let namaToko;
                    switch (order.productInfo.userId.role) {
                        case "vendor":
                            const vendor = await Vendor.findOne({ userId: order.productInfo.userId._id }).populate('address');
                            namaToko = vendor.nama || vendor.namaBadanUsaha;
                            break;
                        default:
                            namaToko = "Role other than vendor";
                            break;
                    }
                    data.push({ order, namaToko });
                });
                await Promise.all(promises);
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
            }

            if (!dataOrders || dataOrders.length < 1) {
                return res.status(200).json({ message: `anda belom memiliki ${req.user.role === "konsumen" ? "order" : "orderan"}` })
            }
            // datas: dataOrders,
            return res.status(200).json({ message: 'get data all Order success', data: dataOrders })
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
            const {
                addressId,
                catatan_produk,
                poinTerpakai,
                biaya_proteksi,
                biaya_asuransi,
                ongkir,
                potongan_ongkir,
                biaya_jasa_aplikasi,
                biaya_layanan,
                metode_pembayaran,
                dp,
                total,
                deadline,
                items,
                shipments
            } = req.body

            if (Object.keys(req.body).length === 0) return res.status(400).json({ message: "Request Body tidak boleh kosong!" });
            if (!req.body["items"]) return res.status(404).json({message: "Tidak ada data items yang dikirimkan, tolong kirimkan data items yang akan dipesan"})
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const date_order = `${dd}/${mm}/${yyyy}`;

            const productIds = items.flatMap(item => 
                item.product.map(prod => prod.productId)
            );
                        
            const products = await Product.find({_id: { $in: productIds }}).select('_id')
            for( const prod of productIds ){
                const found = products.some(item => item._id === prod );
                if(!found) return res.status(404).json({message: `Produk dengan id ${prod} tidak ditemukan`})
            }
            
            if(items.length !== shipments.length) return res.status(400).json({message: "Data Toko tidak sama dengan dengan data pengiriman"})
            
            const dataArrayProduct = []
            let total_price = 0

            // if (cartId.length !== 0) {
            //     const carts = await Carts.find({ _id: { $in: cartId } }).populate({
            //         path: "productId",
            //         populate: {
            //             path: "userId"
            //         }
            //     });

            //     //cek cartId yang diberikan
            //     cartId.forEach((id) => {
            //         const foundCartId = carts.find((element => element._id.toString() === id));
            //         if (!foundCartId) return res.status(404).json({ message: `cart dengan id: ${id} tidak ditemukan` });
            //     });

            //     for (const cart of carts) {
            //         if (cart.userId.toString() !== req.user.id) return res.status(403).json({ message: "Gak bisa pake cart orang lain" });
            //         if (req.user.role === "konsumen" && (cart.productId.userId.role !== "vendor")) return res.status(403).json({ message: `user dengan role ${req.user.role} tidak bisa membeli dari selain dari vendor` });
            //         if (req.user.role === "vendor" && (cart.productId.userId.role !== "supplier")) return res.status(403).json({ message: `user dengan role ${req.user.role} tidak bisa membeli dari selain dari supplier` });
            //         if (req.user.role === "supplier" && (cart.productId.userId.role !== "produsen")) return res.status(403).json({ message: `user dengan role ${req.user.role} tidak bisa membeli dari selain dari produsen` });

            //         total_price += cart.total_price;
            //         dataArrayProduct.push({ productId: cart.productId, quantity: cart.quantity });
            //         await Carts.deleteOne({ _id: cart._id });
            //     }
            // }
            // else if (product.length > 0) {
            //     for (const element of product) {
            //         const dataTotalProduct = await Product.findById(element.productId).populate('userId');

            //         // if( req.user.role === "konsumen" && ( dataTotalProduct.userId.role !== "vendor" ) ) return res.status(403).json({message: `user dengan role ${req.user.role} tidak bisa membeli dari selain dari vendor. Produk ini dari user role ${dataTotalProduct.userId.role}`})
            //         // if( req.user.role === "vendor" && ( dataTotalProduct.userId.role !== "supplier" ) ) return res.status(403).json({message: `user dengan role ${req.user.role} tidak bisa membeli dari selain dari supplier. Produk ini dari user role ${dataTotalProduct.userId.role}`})
            //         // if( req.user.role === "supplier" && ( dataTotalProduct.userId.role !== "produsen" ) ) return res.status(403).json({message: `user dengan role ${req.user.role} tidak bisa membeli dari selain dari produsen. Produk ini dari user role ${dataTotalProduct.userId.role}`})
            //         if (!dataTotalProduct) {
            //             return res.status(404).json({ error: true, message: `Product with ID ${element.productId} not found` });
            //         }

            //         total_price = dataTotalProduct.total_price * element.quantity;

            //         const data = {
            //             productId: element.productId,
            //             quantity: element.quantity
            //         }

            //         dataArrayProduct.push(data)
            //     }
            // }

            if (dataArrayProduct.length > 0) {

                let paymentNumber;
                let nama;
                let idPay;
                let va_user;
                let VirtualAccount;

                const splitted = metode_pembayaran.split(" / ");
                if (splitted[1].includes("Virtual Account")) {
                    va_user = await VaUser.findOne({
                        nama_bank: splitted[0],
                        userId: req.user.id
                    }).populate('nama_bank');

                    VirtualAccount = await VA.findById(splitted[0]);
                    if (!va_user) return res.status(404).json({ message: "User belum memiliki virtual account " + VirtualAccount.nama_bank });
                    idPay = va_user.nama_bank._id;
                    nama = va_user.nama_virtual_account
                } else {
                    paymentNumber = "123"
                }

                const va_used = await VA_Used.findOne({
                    nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
                    userId: req.user.id
                });

                if(va_used) return res.status(403).json({message: "Sedang ada transaki dengan virtual account ini", data: va_used})
                const currentDate = new Date(new Date().getTime() + 24*60*60*1000)
                const dataOrder = await Orders.create({
                    product: dataArrayProduct,
                    addressId,
                    userId: req.user.id,
                    date_order,
                    catatan_produk,
                    poinTerpakai,
                    ongkir,
                    dp: dp ? true : false,
                    potongan_ongkir,
                    biaya_asuransi: biaya_asuransi ? true : false,
                    biaya_proteksi: biaya_proteksi ? true : false,
                    deadline: new Date(deadline),
                    expire: currentDate.setDate(currentDate.getDate()+1)
                });

                const detailPesanan = await DetailPesanan.create({
                    id_pesanan: dataOrder._id,
                    total_price: total,
                    biaya_jasa_aplikasi,
                    biaya_layanan,
                    biaya_asuransi,
                    biaya_proteksi,
                    id_va: metode_pembayaran.includes("Virtual Account") ? idPay : null,
                    id_fintech: metode_pembayaran.includes("Fintech") ? idPay : null,
                    id_gerai_tunai: metode_pembayaran.includes("Gerai") ? idPay : null,
                    id_ewallet: metode_pembayaran.includes("E-Wallet") ? idPay : null,
                    jumlah_dp: dp
                });

                const options = {
                    method: 'POST',
                    headers: {
                      accept: 'application/json',
                      'content-type': 'application/json',
                      Authorization: `Basic ${btoa(process.env.SERVERKEY + ':')}` // Tambahkan ':' di akhir server key untuk otentikasi dasar
                    },
                    body: JSON.stringify({
                      payment_type: 'bank_transfer',
                      transaction_details: {
                        order_id: detailPesanan._id,
                        gross_amount: detailPesanan.total_price
                      },
                      bank_transfer:{
                        bank: 'bca',
                        va_number: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1]
                      },
                    })
                  };
                  
                const respon = await fetch(`${process.env.MIDTRANS_URL}/charge`, options);
                const transaksi = await respon.json();
                await VA_Used.create({
                    userId: req.user.id,
                    orderId: detailPesanan._id,
                    nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1]
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
            } else {
                return res.status(400).json({ message: 'data create tidak valid' })
            }

        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    update_status: async (req, res, next) => {
        try {
            if (!req.body.pesananID || !req.body.status) return res.status(401).json({ message: `Dibutuhkan payload dengan nama pesananID dan status` })

            const pesanan = await Orders.findByIdAndUpdate(req.body.pesananID, { status: req.body.status }, { new: true })

            if (pesanan.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa mengubah data orang lain!" })

            if (!pesanan) return res.status(404).json({ message: `pesanan dengan id: ${req.body.pesananID} tidak ditemukan` })

            return res.status(200).json({ datas: pesanan })
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