const { io } = require("socket.io-client");
const Orders = require("../models/pesanan/model-orders")
const Product = require('../models/model-product');
const axios = require("axios")
const DetailPesanan = require('../models/model-detail-pesanan');
const VaUser = require("../models/model-user-va");
const VA = require("../models/model-virtual-account")
const VA_Used = require("../models/model-va-used");
const { Transaksi, Transaksi2 } = require("../models/model-transaksi")
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const TokoVendor = require('../models/vendor/model-toko');
const User = require("../models/model-auth-user");
const Pengiriman = require("../models/model-pengiriman");
const Invoice = require("../models/model-invoice");
const VirtualAccount = require("../models/model-virtual-account");
const Ewallet = require("../models/model-ewallet");
const GeraiRetail = require("../models/model-gerai");
const Fintech = require("../models/model-fintech");
const Pembatalan = require("../models/model-pembatalan");
const Pesanan = require("../models/pesanan/model-orders");
const VirtualAccountUser = require("../models/model-user-va");
const Sekolah = require("../models/model-sekolah");
const DataProductOrder = require("../models/pesanan/model-data-product-order");
const salesReport = require('../utils/checkSalesReport')
const Notifikasi = require('../models/notifikasi/notifikasi');
const DetailNotifikasi = require('../models/notifikasi/detail-notifikasi');
const ProsesPengirimanDistributor = require("../models/distributor/model-proses-pengiriman");
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

const socket = io('http://localhost:5000', {
    auth: {
        fromServer: true
    }
})

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
                }
                const dataOrders = await Orders.aggregate([
                    { $match: filter },
                    { $project: { 
                            items: 1, 
                            status: 1, 
                            createdAt: 1, 
                            expire: 1, 
                            biaya_layanan: 1, 
                            biaya_jasa_aplikasi: 1,
                            biaya_asuransi: 1,
                            biaya_awal_asuransi: 1,
                            sekolahId: 1 
                        } 
                    },
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
                    { $addFields: { total_pesanan: "$detail_pesanan.total_price" } },
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
                    { $addFields: { 'items.product.productId': "$productInfo" } },
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
                    { $addFields: { 'items.product.productId.userId': "$user_details" } },
                    {
                        $lookup: {
                            from: "specificcategories",
                            localField: "items.product.productId.categoryId",
                            foreignField: "_id",
                            as: "category_details"
                        }
                    },
                    { $unwind: "$category_details" },
                    { $addFields: { 'items.product.productId.categoryId': "$category_details" } },
                    { $project: { productInfo: 0, category_details: 0 } },
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
                            biaya_layanan: { $first: "$biaya_layanan" },
                            biaya_jasa_aplikasi: { $first: "$biaya_jasa_aplikasi" },
                            sekolahId: { $first: "$sekolahId" },
                            biaya_asuransi: { $first: "$biaya_asuransi" },
                            biaya_awal_asuransi: { $first: "$biaya_awal_asuransi" },
                        }
                    },
                    {
                        $sort: {
                            createdAt: -1
                        }
                    }
                ])

                if (!dataOrders || dataOrders.length < 1) {
                    return res.status(200).json({ message: `anda belom memiliki ${req.user.role === "konsumen" ? "order" : "orderan"}` })
                }

                let data = []
                let totalPriceVendor = 0
                
                for (const order of dataOrders) {
                    let { items, status, total_pesanan , biaya_asuransi, biaya_awal_asuransi, ...rest } = order
                    const transaksi = await Transaksi.exists({id_pesanan: order._id, subsidi: false})
                    const transaksiSubsidi = await Transaksi.exists({id_pesanan: order._id, subsidi: true})
                    const sekolah = await Sekolah.findOne({_id: order.sekolahId, userId: req.user.id}).select("jumlahMurid").lean()
                    if(!sekolah) return res.status(404).json({message: "Sekolah tidak ditemukan, akan segera diperbaiki"})
                    let sisaSubsidi = sekolah.jumlahMurid
                    const addedPengiriman = new Set();
                    const dataProduct = await DataProductOrder.findOne({ pesananId: order._id });
                    if (order.status === "Belum Bayar" || order.status === "Dibatalkan") {
                        if(transaksi && transaksiSubsidi){
                            if (transaksiSubsidi) {
                                const store = {};
                                const invoice = await Invoice.findOne({ id_transaksi: transaksiSubsidi._id }).lean();
                                let jumlah_uang = 0;
                                const pengiriman = await Pengiriman.find({ invoice: invoice._id }).populate('distributorId').populate('id_jenis_kendaraan').lean();
                                for (const item of order.items){
                                    const { productId, quantity, ...restOfProduct } = item.product;
                                    const productSelected = dataProduct.dataProduct.find(prod => prod._id.toString() === item.product.productId._id);
                                    if (productSelected && sisaSubsidi >= 0) {
                                        processed = true; // Mark as processed
                            
                                        let detailToko;
                                        const storeId = item.product.productId.userId._id.toString();
                                        switch (item.product.productId.userId.role) {
                                            case "vendor":
                                                detailToko = await TokoVendor.findOne({ userId: storeId }).select('namaToko');
                                                break;
                                            case "supplier":
                                                detailToko = await Supplier.findOne({ userId: storeId });
                                                break;
                                            case "produsen":
                                                detailToko = await Produsen.findOne({ userId: storeId });
                                                break;
                                        }
                            
                                        const selectedPengiriman = pengiriman.find(pgr =>{
                                            return pgr.productToDelivers.some(prd => productSelected._id.toString() === prd.productId.toString())
                                        });

                                        if (!selectedPengiriman) {
                                            continue;
                                        }
                            
                                        const totalQuantity = selectedPengiriman.productToDelivers.find(ship => ship.productId.toString() === productSelected._id.toString());
                                        let itemTotal = productSelected.total_price * totalQuantity.quantity;
                                        totalPriceVendor += itemTotal
                                        jumlah_uang += itemTotal;

                                        if(order.biaya_asuransi){
                                            jumlah_uang += biaya_awal_asuransi * totalQuantity.quantity
                                        }
                            
                                        if (!addedPengiriman.has(selectedPengiriman._id.toString())) {
                                            jumlah_uang += selectedPengiriman.total_ongkir;
                                            addedPengiriman.add(selectedPengiriman._id.toString());
                                        }
                            
                                        if (!store[storeId]) {
                                            store[storeId] = {
                                                total_pesanan: 0,
                                                seller: {
                                                    _id: item.product.productId.userId._id,
                                                    idToko: detailToko._id,
                                                    namaToko: detailToko.namaToko
                                                },
                                                status_pengiriman: [selectedPengiriman],
                                                totalHargaProduk: 0,
                                                arrayProduct: []
                                            };
                                        }
                                        store[storeId].totalHargaProduk += itemTotal
                                        store[storeId].total_pesanan += jumlah_uang;
                                        store[storeId].arrayProduct.push({ productId: productSelected, ...restOfProduct, quantity: totalQuantity.quantity });
                                        sisaSubsidi -= totalQuantity.quantity
                                        jumlah_uang = 0
                                    }
                                }
                                Object.keys(store).forEach(key => {
                                    const {totalHargaProduk, total_pesanan, ...restOfStore} = store[key]
                                    const rasioJasaAplikasi = Math.round(totalHargaProduk / totalPriceVendor * order.biaya_jasa_aplikasi);
                                    const rasioBiayaLayanan = Math.round(totalHargaProduk / totalPriceVendor * order.biaya_layanan);
                                    const jumlah = total_pesanan + rasioJasaAplikasi + rasioBiayaLayanan
                                    data.push({...rest, status: "Berlangsung" , total_pesanan: jumlah, ...restOfStore})
                                });
                            }

                            if (transaksi) {
                                const invoice = await Invoice.findOne({ id_transaksi: transaksi._id });
                                let jumlah_uang = order.biaya_layanan + order.biaya_jasa_aplikasi;
                                const pengiriman = await Pengiriman.find({ invoice: invoice._id }).populate('distributorId').populate('id_jenis_kendaraan').lean();
                                const store = {}
                                for (const item of order.items) {
                                    const { productId, quantity, ...restOfProduct } = item.product;
                                    let detailToko;
                                    const storeId = item.product.productId.userId._id.toString();
                            
                                    switch (item.product.productId.userId.role) {
                                        case "vendor":
                                            detailToko = await TokoVendor.findOne({ userId: storeId }).select('namaToko');
                                            break;
                                        case "supplier":
                                            detailToko = await Supplier.findOne({ userId: storeId });
                                            break;
                                        case "produsen":
                                            detailToko = await Produsen.findOne({ userId: storeId });
                                            break;
                                    }
                            
                                    const selectedPengiriman = pengiriman.find(pgr => {
                                        const found = pgr.productToDelivers.some(prd => {
                                            return item.product.productId._id.toString() === prd.productId.toString();
                                        });
                                        return found;
                                    });
                            
                                    if (!selectedPengiriman) {
                                        continue;
                                    }
                                                        
                                    const totalQuantity = selectedPengiriman.productToDelivers.find(ship => ship.productId.toString() === item.product.productId._id.toString());
                                    let itemTotal = item.product.productId.total_price * totalQuantity.quantity;
                                    if(order.biaya_asuransi) jumlah_uang += order.biaya_awal_asuransi * totalQuantity.quantity
                                    jumlah_uang += itemTotal;
                                    if (!addedPengiriman.has(selectedPengiriman._id.toString())) {
                                        jumlah_uang += selectedPengiriman.total_ongkir;
                                        addedPengiriman.add(selectedPengiriman._id.toString());
                                    }
                            
                                    if (!store[storeId]) {
                                        store[storeId] = {
                                            seller: {
                                                _id: item.product.productId.userId._id,
                                                idToko: detailToko._id,
                                                namaToko: detailToko.namaToko
                                            },
                                            status_pengiriman: selectedPengiriman,
                                            arrayProduct: []
                                        };
                                    }
                            
                                    store[storeId].arrayProduct.push({ productId: item.product.productId, ...restOfProduct, quantity: totalQuantity.quantity });  
                                }
                                const orders = Object.keys(store).map(key => {
                                    return store[key]
                                })
                                data.push({...rest, total_pesanan: jumlah_uang , status: "Belum Bayar", orders})
                            }
                        }
                    }
                    else {
                        let jumlah_uang = 0
                        const store = {}
                        const invoiceSubsidi = await Invoice.exists({id_transaksi: transaksiSubsidi?._id})
                        const invoiceTambahan = await Invoice.exists({id_transaksi: transaksi?._id})
                        const pengiriman = await Pengiriman.find({ orderId: order._id }).populate('distributorId').populate('id_jenis_kendaraan').lean();
                        let totalProductTambahan = 0
                        let totalProductSubsidi = 0  
                        for (const item of order.items){
                            const { productId, quantity, ...restOfProduct } = item.product;
                            const productSelected = dataProduct.dataProduct.find(prod => prod._id.toString() === item.product.productId._id);
                            if (productSelected) {
                                processed = true;
                    
                                let detailToko;
                                const storeId = productSelected.userId._id.toString();
                                switch (productSelected.userId.role) {
                                    case "vendor":
                                        detailToko = await TokoVendor.findOne({ userId: storeId }).select('namaToko');
                                        break;
                                    case "supplier":
                                        detailToko = await Supplier.findOne({ userId: storeId });
                                        break;
                                    case "produsen":
                                        detailToko = await Produsen.findOne({ userId: storeId });
                                        break;
                                }
                    
                                const selectedPengiriman = pengiriman.filter(pgr =>{
                                    return pgr.productToDelivers.some(prd => productSelected._id.toString() === prd.productId.toString())
                                });
                                let totalQuantity = 0
                    
                                if (!store[storeId]) {
                                    store[storeId] = {
                                        total_pesanan: 0,
                                        seller: {
                                            _id: item.product.productId.userId._id,
                                            idToko: detailToko._id,
                                            namaToko: detailToko.namaToko
                                        },
                                        status_pengiriman: selectedPengiriman,
                                        totalHargaSubsidi: 0,
                                        totalHargaTambahan: 0,
                                        arrayProduct: []
                                    };
                                }
                                
                                selectedPengiriman.map(pgr => {
                                    pgr.productToDelivers.map(prd => {
                                        const totalHargaProduk = productSelected.total_price * prd.quantity;
                                        if (prd.productId.toString() === productSelected._id.toString()) {
                                            totalQuantity += prd.quantity;
                                            jumlah_uang += totalHargaProduk;
                                        }
                                
                                        if (pgr.invoice.toString() === invoiceSubsidi?._id.toString()) {
                                            totalProductSubsidi += totalHargaProduk;
                                            store[storeId].totalHargaSubsidi += totalHargaProduk;
                                        }
                                        if (pgr.invoice.toString() === invoiceTambahan?._id.toString()) {
                                            totalProductTambahan += totalHargaProduk;
                                            store[storeId].totalHargaTambahan += totalHargaProduk;
                                        }
                                    });
                                
                                    const pgrIdStr = pgr._id.toString();
                                
                                    if (!addedPengiriman.has(pgrIdStr)) {
                                        jumlah_uang += pgr.total_ongkir;
                                        addedPengiriman.add(pgrIdStr);
                                    }                                
                                });

                                if(order.biaya_asuransi){
                                    jumlah_uang += biaya_awal_asuransi * totalQuantity
                                }
                                store[storeId].total_pesanan += jumlah_uang;
                                store[storeId].arrayProduct.push({ productId: productSelected, ...restOfProduct, quantity: totalQuantity });
                                jumlah_uang = 0
                            }
                        };  
                        Object.keys(store).forEach(key => {
                            let jumlah = 0
                            const {totalHargaSubsidi, totalHargaTambahan, status_pengiriman, total_pesanan, ...restOfStore} = store[key]
                            if(totalHargaTambahan > 0){
                                const rasio = totalHargaTambahan / totalProductTambahan
                                jumlah +=  Math.round(rasio * order.biaya_jasa_aplikasi) + Math.round(rasio * order.biaya_layanan)
                            }
                            if(totalHargaSubsidi > 0){
                                const rasio = totalHargaSubsidi / totalProductSubsidi
                                jumlah +=  Math.round(rasio * order.biaya_jasa_aplikasi) + Math.round(rasio * order.biaya_layanan)
                            }
                            data.push({...rest, status , total_pesanan: total_pesanan + jumlah, status_pengiriman , ...restOfStore})
                        });
                    }
                }
                const filteredData = data.filter(ord => {
                    if(!status) return true
                    return ord.status === status;
                }).sort((a,b)=>{
                    if (a.status === 'Belum Bayar' && b.status !== 'Belum Bayar') {
                        return -1;
                    }
                    if (a.status !== 'Belum Bayar' && b.status === 'Belum Bayar') {
                        return 1;
                    }
                    return 0;
                })
                return res.status(200).json({ message: 'get data all Order success', data: filteredData })
            } else if (req.user.role === 'produsen' || req.user.role === 'supplier' || req.user.role === 'vendor') {
                const products = await Product.find({userId: req.user.id});
                const productIds = products.map(item => { return item._id });
                const filter = {
                    items: {
                        $elemMatch: {
                            product: {
                                $elemMatch: {
                                    productId: { $in: productIds }
                                }
                            }
                        }
                    },
                }
                
                dataOrders = await Pesanan.aggregate([
                    { $match: filter },
                    { $unwind: "$items" },
                    {
                        $addFields: {
                            "items.product": {
                                $filter: {
                                    input: "$items.product",
                                    as: "product",
                                    cond: { $in: ["$$product.productId", productIds] }
                                }
                            }
                        }
                    },
                    { $match: { "items.product": { $not: { $size: 0 } } } },
                    { $project: { shipments: 0}},
                    { $unwind: "$items.product" },
                    {
                        $lookup:{
                            from: "addresses",
                            foreignField: "_id",
                            localField: "addressId",
                            as: "alamat"
                        }
                    },
                    { $unwind: "$alamat" },
                    {
                        $lookup:{
                            from: "sekolahs",
                            foreignField: "_id",
                            localField: "sekolahId",
                            as: "sekolah"
                        }
                    },
                    { $unwind: "$sekolah" },
                    {
                        $group: {
                            _id: "$_id",
                            items: { $push: "$items" },
                            sekolah: { $first: "$sekolah" },
                            alamat: { $first: "$alamat" },
                            date_order: { $first: "$date_order" },
                            status: { $first: "$status" },
                            biaya_layanan: { $first: "$biaya_layanan" },
                            biaya_jasa_aplikasi: { $first: "$biaya_jasa_aplikasi" },
                            poinTerpakai: { $first: "$poinTerpakai" },
                            biaya_asuransi: { $first: "$biaya_asuransi" },
                            biaya_awal_asuransi: { $first: "$biaya_awal_asuransi" },
                            biaya_awal_proteksi: { $first: "$biaya_awal_proteksi" },
                            dp: { $first: "$dp" },
                            expire: { $first: "$expire" },
                            createdAt: { $first: "$createdAt" },
                            updatedAt: { $first: "$updatedAt" },
                        }
                    },
                    {
                        $sort: {
                            createdAt: -1
                        }
                    }
                ]);
                const data = []
                for(const order of dataOrders){
                    const { createdAt, updatedAt, status, items, biaya_layanan, biaya_jasa_aplikasi, poinTerpakai, biaya_asuransi, biaya_awal_asuransi, biaya_awal_proteksi, dp, ...restOfOrder } = order
                    const dataProd = await DataProductOrder.findOne({pesananId: order._id});
                    const transaksiSubsidi = await Transaksi.findOne({id_pesanan: order._id, subsidi: true});
                    const transaksiTambahan = await Transaksi.findOne({id_pesanan: order._id, subsidi: false});
                    const invoiceSubsidi = await Invoice.findOne({id_transaksi: transaksiSubsidi._id});
                    const invoiceTambahan = await Invoice.findOne({id_transaksi: transaksiTambahan?._id, status:"Lunas"});
                    const pengiriman = await Pengiriman.find({orderId: order._id}).populate("distributorId").lean();
                    const proses = await ProsesPengirimanDistributor.exists({pengirimanId: pengiriman._id, status_distributor: { $ne: 'Belum dijemput' }});
                    if(!proses){
                        let detailToko;
                        switch(req.user.role){
                            case "vendor":
                                detailToko = await TokoVendor.findOne({userId: req.user.id});
                                break;
                            default:
                                detailToko = await TokoVendor.findOne({userId: req.user.id});
                                break;
                        };
                        const pesanan = {}
                        const kode_pesanan = new Set()
                        for(const item of order.items){
                            
                            let isApproved = item.isApproved
                            const productSelected = dataProd.dataProduct.find(prd => item.product.productId.toString() === prd._id.toString());
                            if(!kode_pesanan.has(item.kode_pesanan)){
                                kode_pesanan.add(item.kode_pesanan)
                            }
                            if(productSelected){
                                const selectedPengiriman = pengiriman.filter(pgr => {
                                    return pgr.productToDelivers.some(prd => prd.productId.toString() === productSelected._id.toString())
                                })
                                
                                selectedPengiriman.map(pgr => {
                                    const pgrId = pgr._id.toString()
                                    const isDistributtorApprovedCheck = () => {
                                        if(item.isDistributtorApproved){
                                            return true
                                        }else if(!item.isDistributtorApproved){
                                            return null
                                        }else if(pgr.rejected){
                                            return false
                                        }
                                    };

                                    if(pgr.invoice.toString() === invoiceSubsidi._id.toString()){
                                        if(!pesanan[pgrId]){
                                            pesanan[pgrId] = {
                                                pengiriman: pgr,
                                                isApproved,
                                                isDistributtorApproved: isDistributtorApprovedCheck(),
                                                product: []
                                            }
                                        }
                                        const found = pgr.productToDelivers.find(prd => prd.productId.toString() === productSelected._id.toString())
                                        pesanan[pgrId].product.push({ 
                                            product: productSelected, 
                                            quantity: found.quantity, 
                                            totalHargaProduk: productSelected.total_price * found.quantity,
                                            total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0
                                        })
                                    }

                                    if(pgr.invoice.toString() === invoiceTambahan?._id.toString()){
                                        if(!pesanan[pgrId]){
                                            pesanan[pgrId] = {
                                                pengiriman: pgr,
                                                isApproved,
                                                isDistributtorApproved: isDistributtorApprovedCheck(),
                                                product: []
                                            }
                                        }
                                        const found = pgr.productToDelivers.find(prd => prd.productId.toString() === productSelected._id.toString())
                                        pesanan[pgrId].product.push({ 
                                            product: productSelected, 
                                            quantity: found.quantity, 
                                            totalHargaProduk: productSelected.total_price * found.quantity,
                                            total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0
                                        })
                                    }
                                })
                            }
                        }
                        
                        for(const key of Object.keys(pesanan)){
                            const pembatalan = await Pembatalan.findOne({pengirimanId: pesanan[key].pengiriman._id});
                            const checkStatus = () => {
                                if(pesanan[key].pengiriman.isRequestedToPickUp && !pembatalan){
                                    return "Menunggu Distributor"
                                }else if(pesanan[key].pengiriman.sellerApproved && !pembatalan){
                                    return "Dikemas"
                                }else if(!pesanan[key].pengiriman.sellerApproved && !pembatalan){
                                    return "Pesanan Terbaru"
                                }else if(pesanan[key].pengiriman.status_pengiriman === "dikirim" && !pembatalan){
                                    return "Sedang Penjemputan"
                                }
                                else if(pembatalan){
                                    return "Kadaluarsa"
                                }
                                
                            }
                            const checkCreatedAt = () => {
                                if(pesanan[key].pengiriman.invoice._id.toString() === invoiceSubsidi._id.toString()){
                                    return createdAt
                                }else if(pesanan[key].pengiriman.invoice._id.toString() === invoiceTambahan._id.toString()){
                                    return updatedAt
                                }
                            }
                            const { pengiriman, ...restOfPesanan } = pesanan[key]
                            const { waktu_pengiriman, ...restOfPengiriman } = pengiriman
                            data.push({
                                ...restOfOrder,
                                createdAt: checkCreatedAt(),
                                status: checkStatus(),
                                id_pesanan: Array.from(kode_pesanan)[0],
                                pengiriman: {
                                    ...restOfPengiriman,
                                    waktu_pengiriman: new Date(waktu_pengiriman)
                                },
                                ...restOfPesanan
                            })
                        }
                    }
                }
                let filteredData = data.filter((dt)=>{
                    if(!status) return true
                    return dt.status === status
                })
                

                return res.status(200).json({ message: 'get data all Order success', data: filteredData })
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

    automaticVendorOrderCancel: async(req, res, next) => {
        try {
            const products = await Product.find();
            const productIds = products.map(item => item._id);

            const filter = {
                items: {
                    $elemMatch: {
                        product: {
                            $elemMatch: {
                                productId: { $in: productIds }
                            }
                        }
                    }
                },
            }
            
            const dataOrders = await Pesanan.aggregate([
                { $match: filter },
                { $unwind: "$items" },
                {
                    $addFields: {
                        "items.product": {
                            $filter: {
                                input: "$items.product",
                                as: "product",
                                cond: { $in: ["$$product.productId", productIds] }
                            }
                        }
                    }
                },
                { $match: { "items.product": { $not: { $size: 0 } } } },
                { $project: { shipments: 0}},
                { $unwind: "$items.product" },
                {
                    $lookup:{
                        from: "addresses",
                        foreignField: "_id",
                        localField: "addressId",
                        as: "alamat"
                    }
                },
                { $unwind: "$alamat" },
                {
                    $lookup:{
                        from: "sekolahs",
                        foreignField: "_id",
                        localField: "sekolahId",
                        as: "sekolah"
                    }
                },
                { $unwind: "$sekolah" },
                {
                    $group: {
                        _id: "$_id",
                        items: { $push: "$items" },
                        sekolah: { $first: "$sekolah" },
                        alamat: { $first: "$alamat" },
                        date_order: { $first: "$date_order" },
                        status: { $first: "$status" },
                        biaya_layanan: { $first: "$biaya_layanan" },
                        biaya_jasa_aplikasi: { $first: "$biaya_jasa_aplikasi" },
                        poinTerpakai: { $first: "$poinTerpakai" },
                        biaya_asuransi: { $first: "$biaya_asuransi" },
                        biaya_awal_asuransi: { $first: "$biaya_awal_asuransi" },
                        biaya_awal_proteksi: { $first: "$biaya_awal_proteksi" },
                        dp: { $first: "$dp" },
                        expire: { $first: "$expire" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ]);
            for(const order of dataOrders){
                const { userId, createdAt, updatedAt, status, items, biaya_layanan, biaya_jasa_aplikasi, poinTerpakai, biaya_asuransi, biaya_awal_asuransi, biaya_awal_proteksi, dp, ...restOfOrder } = order
                const dataProd = await DataProductOrder.findOne({pesananId: order._id});
                const transaksiSubsidi = await Transaksi.findOne({id_pesanan: order._id, subsidi: true});
                const transaksiTambahan = await Transaksi.findOne({id_pesanan: order._id, subsidi: false});
                const invoiceSubsidi = await Invoice.findOne({id_transaksi: transaksiSubsidi._id});
                const invoiceTambahan = await Invoice.findOne({id_transaksi: transaksiTambahan?._id, status:"Lunas"});
                const pengiriman = await Pengiriman.find({orderId: order._id, sellerApproved: false}).populate("distributorId").lean();
                let detailToko;

                const pesanan = {}
                const kode_pesanan = new Set()
                for(const item of order.items){
                    
                    let isApproved = item.isApproved
                    const productSelected = dataProd.dataProduct.find(prd => item.product.productId.toString() === prd._id.toString());
                    if(!kode_pesanan.has(item.kode_pesanan)){
                        kode_pesanan.add(item.kode_pesanan)
                    }
                    if(productSelected){
                        const selectedPengiriman = pengiriman.filter(pgr => {
                            return pgr.productToDelivers.some(prd => prd.productId.toString() === productSelected._id.toString())
                        })
                        
                        selectedPengiriman.map(pgr => {
                            const pgrId = pgr._id.toString()
                            const isDistributtorApprovedCheck = () => {
                                if(item.isDistributtorApproved){
                                    return true
                                }else if(!item.isDistributtorApproved){
                                    return null
                                }else if(pgr.rejected){
                                    return false
                                }
                            };

                            if(pgr.invoice.toString() === invoiceSubsidi._id.toString()){
                                if(!pesanan[pgrId]){
                                    pesanan[pgrId] = {
                                        pengiriman: pgr,
                                        isApproved,
                                        isDistributtorApproved: isDistributtorApprovedCheck(),
                                        product: []
                                    }
                                }
                                const found = pgr.productToDelivers.find(prd => prd.productId.toString() === productSelected._id.toString())
                                pesanan[pgrId].product.push({ 
                                    product: productSelected, 
                                    quantity: found.quantity, 
                                    totalHargaProduk: productSelected.total_price * found.quantity,
                                    total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0
                                })
                            }

                            if(pgr.invoice.toString() === invoiceTambahan?._id.toString()){
                                if(!pesanan[pgrId]){
                                    pesanan[pgrId] = {
                                        pengiriman: pgr,
                                        isApproved,
                                        isDistributtorApproved: isDistributtorApprovedCheck(),
                                        product: []
                                    }
                                }
                                const found = pgr.productToDelivers.find(prd => prd.productId.toString() === productSelected._id.toString())
                                pesanan[pgrId].product.push({ 
                                    product: productSelected, 
                                    quantity: found.quantity, 
                                    totalHargaProduk: productSelected.total_price * found.quantity,
                                    total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0
                                })
                            }
                        })
                    }
                }
                
                for(const key of Object.keys(pesanan)){
                    const checkCreatedAt = () => {
                        if(pesanan[key].pengiriman.invoice._id.toString() === invoiceSubsidi._id.toString()){
                            return createdAt
                        }else if(pesanan[key].pengiriman.invoice._id.toString() === invoiceTambahan._id.toString()){
                            return updatedAt
                        }
                    }

                    const created = checkCreatedAt()
                    const sixHoursAgo = new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
                    if(created < sixHoursAgo){
                        await Pengiriman.findByIdAndUpdate(pesanan[key].pengiriman._id, {
                            canceled: true,
                            canceledBy: "sistem",
                            userId                    
                        })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    },

    getOrderDetail: async (req, res, next) => {
        try {
            const { sellerId, status_order } = req.query
            const dataOrder = await Orders.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.params.id),
                        userId: new mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $project: {
                        shipments: 0 
                    }
                },
                {
                    $lookup: {
                        from: "detailpesanans",
                        foreignField: 'id_pesanan',
                        localField: "_id",
                        as: "order_detail"
                    }
                },
                {
                    $unwind: "$order_detail"
                },
                {
                    $unwind: "$items"
                },
                {
                    $unwind: "$items.product"
                },
                {
                    $lookup: {
                        from: "products",
                        let: { productId: "$items.product.productId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
                            { $project: { name_product: 1, image_product: 1, userId: 1, total_price: 1 } }
                        ],
                        as: "product_detail"
                    }
                },
                { $unwind: "$product_detail" },
                { $addFields: { 'items.product.productId': "$product_detail" }},
                { $project: { product_detail: 0 }},
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$items.product.productId.userId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                            { $project: { role: 1, _id: 1 } }
                        ],
                        as: "user_detail"
                    }
                },
                { $unwind: "$user_detail" },
                { $addFields: { 'items.product.productId.userId': "$user_detail" }},
                { $project: { user_detail: 0 }},
                {
                    $lookup: {
                        from: "addresses",
                        foreignField: '_id',
                        localField: "addressId",
                        as: "alamat"
                    }
                },
                {
                    $unwind: "$alamat"
                },
                {
                    $addFields: {
                        addressId: "$alamat"
                    }
                },
                { $project: { alamat: 0 } },
                {
                    $group: {
                        _id: "$_id",
                        items: {
                            $push: {
                                product: "$items.product",
                                deadline: '$items.deadline',
                                kode_pesanan: '$items.kode_pesanan'
                            }
                        },
                        userId: { $first: "$userId" },
                        order_detail: { $first: "$order_detail" },
                        addressId: { $first: "$addressId" },
                        expire: { $first: "$expire" },
                        status: { $first: "$status" },
                        biaya_awal_asuransi: { $first: "$biaya_awal_asuransi" },
                        biaya_awal_proteksi: { $first: "$biaya_awal_proteksi" },
                        biaya_layanan: { $first: "$biaya_layanan" },
                        biaya_jasa_aplikasi: { $first: "$biaya_jasa_aplikasi" },
                        createdAt: { $first: "$createdAt" },
                        dp: { $first: "$dp" },
                        biaya_asuransi: { $first: "$biaya_asuransi" },
                    }
                },
                {
                    $project: {
                        data: {
                            _id: "$_id",
                            items: "$items",
                            userId: "$userId",
                            addressId: "$addressId",
                            order_detail: "$order_detail",
                            expire: "$expire",
                            status: "$status",
                            biaya_awal_asuransi: "$biaya_awal_asuransi",
                            biaya_awal_proteksi: "$biaya_awal_proteksi",
                            biaya_layanan: "$biaya_layanan" ,
                            biaya_jasa_aplikasi: "$biaya_jasa_aplikasi",
                            createdAt: "$createdAt",
                            dp: "$dp",
                            biaya_asuransi: "$biaya_asuransi"
                        }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$data" }
                }
            ]);
            if(!dataOrder[0]) return res.status(404).json({message: `Order dengan id: ${req.params.id} tidak ditemukan`})
            const { _id, items, order_detail, addressId, status , biaya_layanan, biaya_jasa_aplikasi, biaya_asuransi , ...restOfOrder } = dataOrder[0]

            const transaksi = await Transaksi.findOne({id_pesanan: _id, subsidi: false})
            const transaksiSubsidi = await Transaksi.exists({id_pesanan: _id, subsidi: true})

            const promises = Object.keys(order_detail).map(async (key) => {
                const paymentMethods = ['id_va', 'id_wallet', 'id_gerai_tunai', 'id_fintech'];
                if (paymentMethods.includes(key) && dataOrder[0].order_detail[key] !== null) {
                    switch (key) {
                        case "id_va":
                            return await VirtualAccount.findById(dataOrder[0].order_detail[key]).lean();
                        case "id_wallet":
                            return await Ewallet.findById(dataOrder[0].order_detail[key]).lean();
                        case "id_gerai_tunai":
                            return await GeraiRetail.findById(dataOrder[0].order_detail[key]).lean();
                        case "id_fintech":
                            return await Fintech.findById(dataOrder[0].order_detail[key]).lean();
                        default:
                            return null;
                    }
                } else {
                    return null;
                }
            });
            const paymentMethod = await Promise.all(promises)
            const data = [] ;
            const detailBiaya = {
                total_harga_produk: 0,
                total_ongkir: 0,
                total_potongan_ongkir: 0,
                total_asuransi: 0,
                total_proteksi: 0
            }
            const addedPengiriman = new Set()
            if( dataOrder[0].status === "Belum Bayar" && status_order === "Belum Bayar" || dataOrder[0].status === "Dibatalkan"){
                const store = {};
                const pembatalan = await Pembatalan.findOne({transaksiId: transaksi._id})
                const invoiceTambahan = await Invoice.findOne({id_transaksi: transaksi._id, status: "Belum Lunas" });
                const pengiriman = await Pengiriman.find({
                    orderId: req.params.id,
                    invoice: invoiceTambahan._id
                }).populate('distributorId').populate("jenis_pengiriman").populate("id_jenis_kendaraan").lean();
                let jumlah_uang = biaya_layanan + biaya_jasa_aplikasi
                for (const item of dataOrder[0].items){
                    const { product, ...restOfItem } = item
                    const { productId, quantity , ...restOfItemProduct } = item.product
                    const selectedPengiriman = pengiriman.find(pgr => {
                        return pgr.productToDelivers.some(prd => {
                            return prd.productId === productId._id
                        })
                    })
                    if(!selectedPengiriman) continue;
                    switch(productId.userId.role){
                        case "vendor":
                            detailToko = await TokoVendor.findOne({ userId: productId.userId._id }).select('namaToko address').populate('address').lean();
                            break;
                        case "supplier":
                            detailToko = await Supplier.findOne({ userId: productId.userId._id }).lean();
                            break;
                        case "produsen":
                            detailToko = await Produsen.findOne({ userId: productId.userId._id }).lean();
                        break;
                    }
                    const user = await User.findById(productId.userId._id).select('email phone').lean()
                    const storeId = productId.userId._id
                    const totalQuantity = selectedPengiriman.productToDelivers.find((prod)=> {
                        return prod.productId === productId._id
                    }, 0);
                    const pgrIdStr = selectedPengiriman._id.toString();        
                    if (!addedPengiriman.has(pgrIdStr)) {
                        jumlah_uang += selectedPengiriman.total_ongkir;
                        detailBiaya.total_ongkir += selectedPengiriman.total_ongkir;
                        detailBiaya.total_potongan_ongkir += selectedPengiriman.potongan_ongkir? selectedPengiriman.potongan_ongkir : 0
                        addedPengiriman.add(pgrIdStr);
                    }                     

                    if(biaya_asuransi){
                        jumlah_uang += dataOrder[0].biaya_awal_asuransi * totalQuantity.quantity
                        detailBiaya.total_asuransi += dataOrder[0].biaya_awal_asuransi * totalQuantity.quantity
                    }
                    const totalItem = totalQuantity.quantity * productId.total_price
                    detailBiaya.total_harga_produk += totalItem;
                    jumlah_uang += totalItem
                    if(!store[storeId]){
                        store[storeId] = {
                            toko: { 
                                userIdSeller: user._id,
                                email: user.email.content, 
                                phone: user.phone.content,  
                                ...detailToko, 
                                ...restOfItem, 
                                status_pengiriman: [selectedPengiriman]
                            },
                            products: []
                        }
                    }
                    store[storeId].products.push({ ...productId, ...restOfItemProduct, quantity: totalQuantity.quantity })
                }
                const pay = paymentMethod.find(item =>{ return item !== null })
                const paymentNumber = await VirtualAccountUser.findOne({userId: req.user.id, nama_bank: pay._id}).select("nomor_va").lean()
                Object.keys(store).forEach(key => data.push(store[key]));
                return res.status(200).json({ 
                    message: 'get detail data order success',
                    _id, 
                    paymentMethod: pay,
                    paymentNumber,
                    alamatUser: addressId,
                    order_detail,
                    total_pesanan: jumlah_uang, 
                    status: pembatalan? "Dibatalkan" : status,
                    dibatalkanOleh: pembatalan? pembatalan.canceledBy : null,
                    invoice: invoiceTambahan , 
                    ...restOfOrder,
                    kode_transaksi: transaksi.kode_transaksi,
                    biaya_layanan,
                    biaya_jasa_aplikasi,
                    ...detailBiaya,
                    data 
                });

            }else {
                const store = {};
                const transaksiOrder = await Transaksi.find({ id_pesanan: req.params.id });
                const detailInvoiceTambahan = {
                    product: [],
                    totalHargaProduk: 0,
                    totalOngkir: 0,
                    totalDiskon: 0,
                    asuransiPengiriman: 0,
                    totalPotonganOngkir: 0,
                    biaya_layanan: 0,
                    biaya_jasa_aplikasi: 0
                };
                const detailInvoiceSubsidi = {
                    product: [],
                    totalHargaProduk: 0,
                    totalOngkir: 0,
                    totalDiskon: 0,
                    asuransiPengiriman: 0,
                    totalPotonganOngkir: 0,
                    biaya_layanan: 0,
                    biaya_jasa_aplikasi: 0
                };
                const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksiSubsidi?._id });
                const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi?._id, status: "Lunas" });
                let jumlah_uang = 0
                const dataProduct = await DataProductOrder.findOne({ pesananId: req.params.id });

                const addedPengiriman = new Set();
                let totalPriceVendorSubsidi = 0
                let totalPriceVendorTambahan = 0
                let total_biaya_layanan = 0
                let total_biaya_jasa_aplikasi = 0
                for (const item of items) {
                    const { product, ...restOfItem } = item;
                    const { productId, quantity, ...restOfItemProduct } = product;
                    const { userId, ...restOfProduct } = productId;
                    const user = await User.findById(userId._id).select('email phone').lean();

                    const productSummary = dataProduct.dataProduct.find(prod => {
                        return prod._id.toString() === productId._id.toString();
                    });

                    
                    let detailToko;
                    switch (userId.role) {
                        case "vendor":
                            detailToko = await TokoVendor.findOne({ userId: sellerId }).select('namaToko address').populate('address').lean();
                            break;
                        case "supplier":
                            detailToko = await Supplier.findOne({ userId: sellerId }).lean();
                            break;
                        case "produsen":
                            detailToko = await Produsen.findOne({ userId: sellerId }).lean();
                            break;
                    }

                    const pengiriman = await Pengiriman.find({
                        orderId: req.params.id,
                    }).populate('distributorId').populate("jenis_pengiriman").populate("id_jenis_kendaraan").lean();

                    pengiriman.filter(pgr => {
                        return pgr.productToDelivers.some(prd => prd.productId.toString() === productSummary?._id.toString()) && pgr.invoice.toString() === invoiceTambahan?._id.toString()
                    }).forEach(pgr =>{
                        console.log(pgr.id_toko)
                        pgr.productToDelivers.forEach(prd => { 
                            if(prd.productId.toString() === productSummary._id.toString()){
                                totalPriceVendorTambahan += prd.quantity * productSummary.total_price
                            }
                        })
                    })

                    pengiriman.filter(pgr => {
                        return pgr.productToDelivers.some(prd => prd.productId.toString() === productSummary?._id.toString()) && pgr.invoice.toString() === invoiceSubsidi?._id.toString()
                    }).forEach(pgr =>{
                        console.log(pgr.id_toko)
                        pgr.productToDelivers.forEach(prd => { 
                            if(prd.productId.toString() === productSummary._id.toString()){
                                totalPriceVendorSubsidi += prd.quantity * productSummary.total_price
                            }
                        })
                    });
                    
                    const selectedPengirimanSubsidi = pengiriman.find(pgr => {
                        return pgr.productToDelivers.some(prd => prd.productId.toString() === productId._id.toString()) && pgr.invoice.toString() === invoiceSubsidi?._id.toString() && pgr.id_toko.toString() === detailToko._id.toString();
                    });

                    const selectedPengirimanTambahan = pengiriman.find(pgr => {
                        return pgr.productToDelivers.some(prd => prd.productId.toString() === productId._id.toString()) && pgr.invoice.toString() === invoiceTambahan?._id.toString() && pgr.id_toko.toString() === detailToko._id.toString();
                    });

                    let quantityProduct = 0;
                    const productSelected = dataProduct.dataProduct.find(prod => {
                        return prod._id.toString() === productId._id.toString() && prod.userId._id.toString() === sellerId.toString();
                    });

                    if(selectedPengirimanSubsidi){
                        const foundProd = selectedPengirimanSubsidi.productToDelivers.find(prd => productSelected._id.toString() === prd.productId.toString());
                        if (!addedPengiriman.has(selectedPengirimanSubsidi._id.toString())) {
                            detailInvoiceSubsidi.totalOngkir += selectedPengirimanSubsidi.ongkir;
                            detailInvoiceSubsidi.totalPotonganOngkir += selectedPengirimanSubsidi.potongan_ongkir;
                            detailBiaya.total_potongan_ongkir += selectedPengirimanSubsidi.potongan_ongkir;
                            detailBiaya.total_ongkir += selectedPengirimanSubsidi.total_ongkir;
                            jumlah_uang += selectedPengirimanSubsidi.total_ongkir;
                        }
                        if (biaya_asuransi) {
                            detailInvoiceSubsidi.asuransiPengiriman +=  dataOrder[0].biaya_awal_asuransi * foundProd.quantity;
                        };
                        detailInvoiceSubsidi.totalHargaProduk += productSelected.total_price * foundProd.quantity;
                        detailInvoiceSubsidi.product.push({ name_product: productSelected.name_product, harga: productSelected.total_price, quantity: foundProd.quantity });
                        jumlah_uang += productSelected.total_price * foundProd.quantity;
                        const total_produk = productSelected.total_price * foundProd.quantity
                        detailBiaya.total_harga_produk += total_produk;
                        quantityProduct += foundProd.quantity;
                        addedPengiriman.add(selectedPengirimanSubsidi._id.toString());
                    }

                    if(selectedPengirimanTambahan){
                        const foundProd = selectedPengirimanTambahan.productToDelivers.find(prd => productSelected._id.toString() === prd.productId.toString());
                        if (!addedPengiriman.has(selectedPengirimanTambahan._id.toString())) {
                            detailInvoiceTambahan.totalOngkir += selectedPengirimanTambahan.ongkir;
                            detailInvoiceTambahan.totalPotonganOngkir += selectedPengirimanTambahan.potongan_ongkir;
                            detailBiaya.total_potongan_ongkir += selectedPengirimanTambahan.potongan_ongkir;
                            detailBiaya.total_ongkir += selectedPengirimanTambahan.total_ongkir;
                            jumlah_uang += selectedPengirimanTambahan.total_ongkir;            
                        }
                        if (biaya_asuransi) {
                            detailInvoiceTambahan.asuransiPengiriman +=  dataOrder[0].biaya_awal_asuransi * foundProd.quantity;
                        };
                        detailInvoiceTambahan.totalHargaProduk += productSelected.total_price * foundProd.quantity;
                        detailInvoiceTambahan.product.push({ name_product: productSelected.name_product, harga: productSelected.total_price, quantity: foundProd.quantity });
                        jumlah_uang += productSelected.total_price * foundProd.quantity;
                        const total_produk = productSelected.total_price * foundProd.quantity
                        detailBiaya.total_harga_produk += total_produk;
                        quantityProduct += foundProd.quantity;                       
                        addedPengiriman.add(selectedPengirimanTambahan._id.toString());
                    }

                    if (biaya_asuransi) {
                        jumlah_uang += dataOrder[0].biaya_awal_asuransi * quantityProduct;
                        detailBiaya.total_asuransi += dataOrder[0].biaya_awal_asuransi * quantityProduct;
                    };

                    if(productSelected){
                        if (!store[userId._id]) {
                            store[userId._id] = {
                                toko: {
                                    userIdSeller: user._id,
                                    email: user.email.content,
                                    phone: user.phone.content,
                                    ...detailToko,
                                    ...restOfItem,
                                    status_pengiriman: pengiriman.filter(pgr => pgr.id_toko.toString() === detailToko._id.toString())
                                },
                                products: []
                            };
                        }
                        store[userId._id].products.push({ ...productSelected, ...restOfItemProduct, quantity: quantityProduct });                    
                    }
                }

                Object.keys(store).forEach(key =>{
                    const total_produk_tambahan = detailInvoiceTambahan.totalHargaProduk
                    const total_produk_subsidi = detailInvoiceSubsidi.totalHargaProduk
                    const rasioJasaAplikasiSubsidi = totalPriceVendorSubsidi > 0 ? Math.round(total_produk_subsidi / totalPriceVendorSubsidi * biaya_jasa_aplikasi) : 0;
                    const rasioBiayaLayananSubsidi = totalPriceVendorSubsidi > 0 ? Math.round(total_produk_subsidi / totalPriceVendorSubsidi * biaya_layanan) : 0;
                    const rasioJasaAplikasiTambahan = totalPriceVendorTambahan > 0 ? Math.round(total_produk_tambahan / totalPriceVendorTambahan * biaya_jasa_aplikasi) : 0;
                    const rasioBiayaLayananTambahan = totalPriceVendorTambahan > 0 ? Math.round(total_produk_tambahan / totalPriceVendorTambahan * biaya_layanan) : 0;
                    detailInvoiceTambahan.biaya_jasa_aplikasi += rasioJasaAplikasiTambahan
                    detailInvoiceTambahan.biaya_layanan += rasioBiayaLayananTambahan
                    detailInvoiceSubsidi.biaya_jasa_aplikasi += rasioJasaAplikasiSubsidi
                    detailInvoiceSubsidi.biaya_layanan += rasioBiayaLayananSubsidi
                    total_biaya_jasa_aplikasi += rasioJasaAplikasiTambahan
                    total_biaya_layanan += rasioBiayaLayananTambahan    
                    total_biaya_jasa_aplikasi += rasioJasaAplikasiSubsidi
                    total_biaya_layanan += rasioBiayaLayananSubsidi
                    data.push(store[key])
                })
                jumlah_uang += total_biaya_layanan + total_biaya_jasa_aplikasi
                const pembatalan = await Pembatalan.findOne({pesananId: _id, userId: req.user.id });    
                const pay = paymentMethod.find(item =>{ return item !== null })
                const paymentNumber = await VirtualAccountUser.findOne({userId: req.user.id, nama_bank: pay._id}).select("nomor_va").lean()
                const checkStatus = () => {
                    if(pembatalan){
                        return "Dibatalkan"
                    }else if(transaksiOrder.length > 1 && status === "Belum Bayar"){
                        return "Berlangsung"
                    }else{
                        return status
                    }
                }
                const respon = { 
                    message: 'get detail data order success',
                    _id, 
                    paymentMethod: pay,
                    paymentNumber,
                    alamatUser: addressId,
                    order_detail,
                    total_pesanan: jumlah_uang, 
                    status: checkStatus(),
                    dibatalkanOleh: pembatalan? pembatalan.canceledBy : null,
                    invoice: invoiceSubsidi ,
                    invoiceTambahan: invoiceTambahan?  invoiceTambahan : null,
                    detailInvoiceSubsidi,
                    detailInvoiceTambahan,
                    biaya_layanan: Math.round(total_biaya_layanan),
                    biaya_jasa_aplikasi: Math.round(total_biaya_jasa_aplikasi),
                    ...restOfOrder,
                    kode_transaksi: transaksi?.kode_transaksi || transaksiSubsidi?.kode_transaksi,
                    ...detailBiaya,
                    data 
                }

                return res.status(200).json(respon)
            }
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
                poin_terpakai,
                sekolahId,
                biaya_awal_asuransi
            } = req.body
            console.log(JSON.stringify(req.body))
            if (Object.keys(req.body).length === 0) return res.status(400).json({ message: "Request Body tidak boleh kosong!" });
            if(!sekolahId) return res.status(400).json({message: "Kirimkan Id Sekolah"})
            if (!req.body["items"]) return res.status(404).json({ message: "Tidak ada data items yang dikirimkan, tolong kirimkan data items yang akan dipesan" })
            if (!Array.isArray(req.body['items'])) return res.status(400).json({ message: "Body items bukan array, kirimkan array" })

            let total_pesanan = await Orders.countDocuments({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });

            const user = await User.findById(req.user.id)

            items.forEach((item, index) => {
                item.kode_pesanan = `PSN_${user.get('kode_role')}_${date}_${minutes}_${total_pesanan + index + 1}`;
                total_pesanan += 1
            });

            const productIds = items.flatMap(item => 
                item.product.map(prod => ({
                    productId: prod.productId,
                    quantity: prod.quantity
                }))
            );

            const products = await Product.find({ _id: { $in: productIds.map(prd => prd.productId) } }).select('_id name_product total_stok minimalOrder image_product')

            for (const prod of productIds) {
                const found = products.find(item => item._id === prod.productId.toString());
                if (!found) return res.status(404).json({ message: `Produk dengan id ${prod.productId} tidak ditemukan` })
                if(found.total_stok < prod.quantity) return res.status(400).json({message: `Produk ${found.name_product} dipesan melebihi stok tersedia`})
                if(found.minimalOrder > prod.quantity) return res.status(400).json({message: `Produk ${found.name_product} tidak bisa dipesan kurang dari minimal pemesanan`})
            }

            if (items.length !== shipments.length) return res.status(400).json({ message: "ama dengan dengan data pengiriman" })

            let va_user;
            let VirtualAccount;
            let idPay;
            let nama;

            const splitted = metode_pembayaran.split(" / ");
            if (splitted[1].replace(/\u00A0/g, ' ') == "Virtual Account") {
                va_user = await VaUser.findOne({
                    nama_bank: splitted[0],
                    userId: req.user.id
                }).populate('nama_bank')
                VirtualAccount = await VA.findById(splitted[0]);
                if (!va_user) return res.status(404).json({ message: "User belum memiliki virtual account " + VirtualAccount.nama_bank });
                idPay = va_user.nama_bank._id,
                    nama = va_user.nama_virtual_account
            } else {
                paymentNumber = "123"
            }

            const va_used = await VA_Used.findOne({
                nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
                userId: req.user.id
            })

            if (va_used) return res.status(403).json({ message: "Sedang ada transaki dengan virtual account ini", data: va_used });
            const decimalPattern = /^\d+\.\d+$/;
            if (decimalPattern.test(total)) return res.status(400).json({ message: `Total yang dikirimkan tidak boleh decimal. ${total}` })
            const idPesanan = new mongoose.Types.ObjectId()

            const a_day_later = new Date(today.getTime() + 24 * 60 * 60 * 1000)
            const dataOrder = await Orders.create({
                ...req.body,
                userId: req.user.id,
                date_order: date,
                biaya_asuransi: biaya_asuransi ? true : false,
                expire: a_day_later
            });
            let total_pengiriman = await Pengiriman.countDocuments({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });
            
            const promisesFunct = []

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

            let total_transaksi = await Transaksi.countDocuments({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });

            const sekolah = await Sekolah.findOne({_id: sekolahId, userId: req.user.id})
            if(!sekolah) return res.status(404).json({message: "Tidak ada sekolah yang ditemukan"})
            let totalQuantity = 0
            const ids = []
            items.map(item => {
                item.product.map(prod => ids.push(prod.productId))
                item.product.map( prod => {
                    totalQuantity += prod.quantity
                })
            })
            const arrayProducts = await Product.find({_id: {$in: ids}}).populate({path: "userId", select: "_id role"}).populate('categoryId').lean()
            let transaksiMidtrans;
            let total_tagihan = biaya_jasa_aplikasi + biaya_layanan;
            const detailBiaya = {
                totalHargaProduk: 0,
                totalOngkir: 0,
                totalPotonganOngkir: 0,
                jumlahOngkir: 0,
                asuransiPengiriman: 0,
                biaya_jasa_aplikasi,
                biaya_layanan
            };

            const detailBiayaSubsidi = {
                totalHargaProduk: 0,
                totalOngkir: 0,
                totalPotonganOngkir: 0,
                jumlahOngkir: 0,
                asuransiPengiriman: 0,
                biaya_jasa_aplikasi,
                biaya_layanan
            };

            const detailBiayaTambahan = {
                totalHargaProduk: 0,
                totalOngkir: 0,
                totalPotonganOngkir: 0,
                jumlahOngkir: 0,
                asuransiPengiriman: 0,
                biaya_jasa_aplikasi,
                biaya_layanan
            };

            if ((sekolah.jumlahMurid === totalQuantity) || (sekolah.jumlahMurid > totalQuantity)) {
                const idInvoiceSubsidi = new mongoose.Types.ObjectId()
                
                items.map((item)=>{
                    item.product.map(prd=>{
                        const foundedProd = arrayProducts.find(prod => prod._id.toString() === prd.productId.toString());
                        detailBiaya.totalHargaProduk += foundedProd.total_price * prd.quantity;
                        if(biaya_asuransi){
                            total_tagihan += prd.quantity * biaya_awal_asuransi
                            detailBiaya.asuransiPengiriman += prd.quantity * biaya_awal_asuransi
                        };

                        promisesFunct.push(
                            Product.findOneAndUpdate(
                                { _id: prd.productId},
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
                    })
                });

                for (let i = 0; i < dataOrder.shipments.length; i++) {

                    detailBiaya.totalOngkir += dataOrder.shipments[i].ongkir
                    detailBiaya.totalPotonganOngkir += dataOrder.shipments[i].potongan_ongkir
                    detailBiaya.jumlahOngkir += dataOrder.shipments[i].total_ongkir

                    promisesFunct.push(
                        Pengiriman.create({
                            orderId: dataOrder._id,
                            distributorId: dataOrder.shipments[i].id_distributor,
                            productToDelivers: dataOrder.shipments[i].products,
                            waktu_pengiriman: new Date(dataOrder.items[i].deadline),
                            total_ongkir: dataOrder.shipments[i].total_ongkir,
                            ongkir: dataOrder.shipments[i].ongkir,
                            potongan_ongkir: dataOrder.shipments[i].potongan_ongkir,
                            jenis_pengiriman: dataOrder.shipments[i].id_jenis_layanan,
                            id_jenis_kendaraan: dataOrder.shipments[i].id_jenis_kendaraan,
                            id_toko: dataOrder.shipments[i].id_toko_vendor,
                            kode_pengiriman: `PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
                            invoice: idInvoiceSubsidi
                        })
                    );
                    total_pengiriman += 1;
                };

                const kode_transaksi = await Transaksi.create({
                    id_pesanan: dataOrder._id,
                    jenis_transaksi: "keluar",
                    status: "Menunggu Pembayaran",
                    subsidi: true,
                    detailBiaya,
                    kode_transaksi: `TRX_${user.get('kode_role')}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`
                });

                const invoice = await Invoice.create({
                    _id: idInvoiceSubsidi,
                    id_transaksi: kode_transaksi,
                    userId: req.user.id,
                    status: "Piutang",
                    kode_invoice: `INV_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
                });

                promisesFunct.push(
                    DataProductOrder.create({
                        pesananId: dataOrder._id,
                        dataProduct: arrayProducts
                    }),
                    Orders.findByIdAndUpdate(dataOrder._id, { status: "Berlangsung" })
                )

                const formatHarga = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

                const notifikasi = await Notifikasi.create({
                    userId: user._id,
                    invoiceId: invoice._id,
                    jenis_invoice: "Subsidi",
                    createdAt: new Date(),
                })
                

                const detailInvoice = await DetailNotifikasi.create({
                    notifikasiId: notifikasi._id,
                    jenis: "Info",
                    status: "Pesanan Makanan Bergizi Gratis telah berhasil",
                    message: `${invoice.kode_invoice} Senilai Rp. ${formatHarga} telah berhasil, pesanan akan segera diproses`,
                    image_product: products[0].image_product[0], 
                    createdAt: new Date()
                })
                    
                socket.emit('notif_pesanan_berhasil', {
                    jenis: detailInvoice.jenis,
                    userId: user._id,
                    message: detailInvoice.message,
                    status: detailInvoice.status,
                    image: detailInvoice.image_product,
                    tanggal: `${formatTanggal(detailInvoice.createdAt)}`,
                });

            } else if (totalQuantity > sekolah.jumlahMurid) {
                function generateKodeInovoice(){
                    return `INV_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
                }

                const id_transaksi_subsidi = new mongoose.Types.ObjectId();
                const id_invoice_subsidi = new mongoose.Types.ObjectId()
                const id_transaksi_non_subsidi = new mongoose.Types.ObjectId();
                const id_invoice_non_subsidi = new mongoose.Types.ObjectId();
                let sisaSubsidi = sekolah.jumlahMurid;
                let productNotif
                const kodeInvoice = `INV_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
                const ids=[]
                for (const item of items) {
                    const dapatSubsidi = [];
                    const tidakDapatSubsidi = [];

                    for (const prod of item.product) {
                        if (prod.quantity <= sisaSubsidi) {
                            dapatSubsidi.push({
                                productId: prod.productId,
                                quantity: prod.quantity
                            });
                            sisaSubsidi -= prod.quantity;
                        } else {
                            if (sisaSubsidi > 0) {
                                dapatSubsidi.push({
                                    productId: prod.productId,
                                    quantity: sisaSubsidi
                                });
                                tidakDapatSubsidi.push({
                                    productId: prod.productId,
                                    quantity: prod.quantity - sisaSubsidi
                                });
                                sisaSubsidi = 0;
                            } else {
                                tidakDapatSubsidi.push({
                                    productId: prod.productId,
                                    quantity: prod.quantity
                                });
                            }
                        }
                    };

                    let pengirimanSubsidi;
                    let pengirimanNonSubsidi;
                    let total_subsidi = 0

                    dapatSubsidi.map(ds => {
                        shipments.find(ship => {
                            ship.products.map(prod => { if(prod.productId === ds.productId) pengirimanSubsidi = ship });
                        });
                    });

                    tidakDapatSubsidi.map(tds => {
                        shipments.find(ship => {
                            ship.products.map(prod => { if(prod.productId === tds.productId) pengirimanNonSubsidi = ship });
                        });
                    });

                    if(dapatSubsidi.length > 0){

                        const totalProduk = pengirimanSubsidi.products.reduce((accumulator, currentValue)=>{
                            return accumulator + currentValue.quantity
                        }, 0);

                        const totalProdukSubsidi = dapatSubsidi.reduce((acc, val)=>{
                            ids.push(val.productId)
                            return acc + val.quantity
                        }, 0)

                        const baseOngkir = pengirimanSubsidi.ongkir / totalProduk
                        const basePotonganOngkir = pengirimanSubsidi.potongan_ongkir / totalProduk
                        const potongan_ongkir = Math.round(basePotonganOngkir * totalProdukSubsidi);
                        const ongkir = Math.round(baseOngkir * totalProdukSubsidi);
                        const total_ongkir = ongkir - potongan_ongkir
                        detailBiayaSubsidi.totalOngkir += ongkir
                        detailBiayaSubsidi.totalPotonganOngkir += potongan_ongkir;
                        detailBiayaSubsidi.jumlahOngkir += total_ongkir
                        total_subsidi += total_ongkir;
                        let productIds = [];
                        
                        for(const prd of dapatSubsidi){
                            const prod = await Product.findById(prd.productId).select("total_price").lean();
                            productIds.push(prd.productId)
                            total_subsidi += prod.total_price * prd.quantity;
                            detailBiayaSubsidi.totalHargaProduk += prod.total_price * prd.quantity
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
                        promisesFunct.push(
                            Pengiriman.create({
                                orderId: dataOrder._id,
                                distributorId: pengirimanSubsidi.id_distributor,
                                productToDelivers: dapatSubsidi,
                                waktu_pengiriman: item.deadline,
                                total_ongkir,
                                ongkir,
                                potongan_ongkir,
                                jenis_pengiriman: pengirimanSubsidi.id_jenis_layanan,
                                id_jenis_kendaraan: pengirimanSubsidi.id_jenis_kendaraan,
                                id_toko: pengirimanSubsidi.id_toko_vendor,
                                kode_pengiriman: `PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
                                invoice: id_invoice_subsidi
                            }),
                        )

                        const products = await Product.find({_id: {$in: productIds}})
                        .select("_id total_price name_product image_product")
                        const formatHarga = total_subsidi.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        
                        const notifikasiSubdisi = await Notifikasi.create({
                            userId: user._id,
                            invoiceId: id_invoice_subsidi,
                            jenis_invoice: "Subsidi",
                            createdAt: new Date(),
                        })

                        const detailNotifSubsidi = await DetailNotifikasi.create({
                            notifikasiId: notifikasiSubdisi._id,
                            jenis: "Info",
                            status: "Pesanan Makanan Bergizi Gratis telah berhasil",
                            message: `${kodeInvoice} Senilai Rp. ${formatHarga} telah berhasil, pesanan akan segera diproses`,
                            image_product: products[0].image_product[0], 
                            createdAt: new Date()
                        })

                        socket.emit('notif_pesanan_berhasil', {
                            jenis: detailNotifSubsidi.jenis,
                            userId: user._id,
                            status: detailNotifSubsidi.status,
                            message: detailNotifSubsidi.message,
                            image: detailNotifSubsidi.image_product,
                            tanggal: `${formatTanggal(detailNotifSubsidi.createdAt)}`,
                        })
                    }

                    if (tidakDapatSubsidi.length > 0) {
                        productNotif = await Product.findById(tidakDapatSubsidi[0].productId).select("_id name_product image_product");
                        const totalProdukSubsidi = tidakDapatSubsidi.reduce((acc, val) => acc + val.quantity, 0);
                        const totalProduk = pengirimanNonSubsidi.products.reduce((acc, prod) => acc + prod.quantity, 0);
                        const baseOngkir = pengirimanNonSubsidi.ongkir / totalProduk;
                        const basePotonganOngkir = pengirimanNonSubsidi.potongan_ongkir / totalProduk
                        const potongan_ongkir = Math.round(basePotonganOngkir * totalProdukSubsidi)
                        const ongkir = Math.round(baseOngkir * totalProdukSubsidi)
                        const total_ongkir = ongkir - potongan_ongkir
                        detailBiayaTambahan.totalOngkir += ongkir
                        detailBiayaTambahan.totalPotonganOngkir += potongan_ongkir;
                        detailBiayaTambahan.jumlahOngkir += total_ongkir

                        for (const prod of tidakDapatSubsidi) {
                            const product = await Product.findById(prod.productId).select('total_price').lean();
                            total_tagihan += product.total_price * prod.quantity;
                            detailBiayaTambahan.totalHargaProduk += product.total_price * prod.quantity
                            if(biaya_asuransi){
                                total_tagihan += prod.quantity * biaya_awal_asuransi
                            }
                        }

                        promisesFunct.push(
                            Pengiriman.create({
                                orderId: dataOrder._id,
                                distributorId: pengirimanNonSubsidi.id_distributor,
                                productToDelivers: tidakDapatSubsidi,
                                waktu_pengiriman: item.deadline,
                                total_ongkir,
                                ongkir,
                                potongan_ongkir,
                                jenis_pengiriman: pengirimanNonSubsidi.id_jenis_layanan,
                                id_jenis_kendaraan: pengirimanNonSubsidi.id_jenis_kendaraan,
                                id_toko: pengirimanNonSubsidi.id_toko_vendor,
                                kode_pengiriman: `PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
                                invoice: id_invoice_non_subsidi
                            }),
                        );
                
                        total_tagihan += total_ongkir;
                    }
                    total_pengiriman += 1
                }
                const arrayProducts = await Product.find({_id: {$in: ids}}).populate({path: "userId", select: "_id role"}).populate('categoryId').lean()
                
                promisesFunct.push(
                    Transaksi.create({
                        _id: id_transaksi_subsidi,
                        id_pesanan: dataOrder._id,
                        jenis_transaksi: "keluar",
                        status: "Menunggu Pembayaran",
                        subsidi: true,
                        detailBiaya: detailBiayaSubsidi,
                        kode_transaksi: `TRX_${user.get('kode_role')}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`
                    }),

                    Transaksi.create({
                        _id: id_transaksi_non_subsidi,
                        id_pesanan: dataOrder._id,
                        jenis_transaksi: "keluar",
                        status: "Menunggu Pembayaran",
                        detailBiaya: detailBiayaTambahan,
                        subsidi: false,
                        kode_transaksi: `TRX_${user.get('kode_role')}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`
                    }),

                    Invoice.create({
                        _id: id_invoice_subsidi,
                        id_transaksi: id_transaksi_subsidi,
                        userId: req.user.id,
                        status: "Piutang",
                        kode_invoice: `INV_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
                    }),

        
                    Invoice.create({
                        _id: id_invoice_non_subsidi,
                        id_transaksi: id_transaksi_non_subsidi,
                        userId: req.user.id,
                        status: "Belum Lunas",
                        kode_invoice: `INV_${user.get('kode_role')}_${date}_${minutes}_${total_transaksi + 1}`
                    }),

                    DataProductOrder.create({
                        pesananId: dataOrder._id,
                        dataProduct: arrayProducts
                    })
                )
                const grossAmount = () => {
                    if (dp.isUsed && poin_terpakai) {
                        return (dp.value * Math.round(total_tagihan)) - poin_terpakai;
                    } else if (dp.isUsed) {
                        return dp.value * Math.round(total_tagihan);
                    } else {
                        return Math.round(total_tagihan);
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
                        bank_transfer: {
                            bank: 'bca',
                            va_number: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1]
                        },
                    })
                };

                

                const respon = await fetch(`${process.env.MIDTRANS_URL}/charge`, options);
                transaksiMidtrans = await respon.json();

                promisesFunct.push(
                    VA_Used.create({
                        nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
                        orderId: idPesanan,
                        userId: req.user.id
                    })
                )
                const formatHarga = total_tagihan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                const notifikasiNonSubsidi = await Notifikasi.create({
                    userId: user._id,
                    invoiceId: id_invoice_non_subsidi,
                    jenis_invoice: "Non Subsidi",
                    createdAt: new Date(),
                })

                const detailNotifNonSubsidi = await DetailNotifikasi.create({
                    notifikasiId: notifikasiNonSubsidi._id,
                    jenis: "Info",
                    status: "Selesaikan pembayaranmu",
                    message: `${kodeInvoice} Senilai Rp. ${formatHarga} belum dibayar, segera seleasikan pembayaranmu sebelum ${formatTanggal(a_day_later)}`, 
                    image_product: productNotif.image_product[0],
                    createdAt: new Date() 
                })
                
                socket.emit("notif_selesaikan_pembayaran", {
                    userId: user._id,
                    jenis: detailNotifNonSubsidi.jenis,
                    status: detailNotifNonSubsidi.status,
                    message: detailNotifNonSubsidi.message,
                    image: detailNotifNonSubsidi.image_product,
                    tanggal: `${formatTanggal(detailNotifNonSubsidi.createdAt)}`,
                })
            }
            await Promise.all(promisesFunct)

            return res.status(201).json({
                message: `Berhasil membuat Pesanan dengan Pembayaran ${splitted[1]}`,
                datas: dataOrder,
                nama,
                paymentNumber: transaksiMidtrans ? transaksiMidtrans.va_numbers[0].va_number : null,
                total_tagihan,
                transaksi: transaksiMidtrans? {
                    waktu: transaksiMidtrans.transaction_time,
                    orderId: transaksiMidtrans.order_id
                } : null
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

    update_shipments: async(req, res, next) => {
        try {
            const { 
                old_id_toko_vendor, 
                old_id_distributor, 
                new_id_distributor, 
                total_ongkir, 
                potongan_ongkir, 
                ongkir, 
                id_jenis_kendaraan, 
                jenis_pengiriman 
            } = req.body

            const updateFields = {
                'shipments.$.id_distributor': new_id_distributor,
                'shipments.$.total_ongkir': total_ongkir,
                'shipments.$.ongkir': ongkir,
                'shipments.$.potongan_ongkir': potongan_ongkir,
                'shipments.$.id_jenis_kendaraan': id_jenis_kendaraan,
                'shipments.$.jenis_pengiriman': jenis_pengiriman,
            };

            const order = await Orders.findOne(
                { _id: req.params.id, userId: req.user.id, 'shipments.id_distributor': old_id_distributor, 'shipments.id_toko_vendor': old_id_toko_vendor, status: "Berlangsung" },
            ).lean();
            
            if(!order) return res.status(404).json({message: "Tidak ditemukan order dan pengiriman"});

            const filteredIndex = order.shipments.findIndex( item => {
                return item.id_distributor.toString() === old_id_distributor && item.id_toko_vendor.toString() === old_id_toko_vendor
            });
            
            const products = order.shipments[filteredIndex].products.map( item => {
                return item.productId
            });

            const updatedOrder = await Orders.findOneAndUpdate(
                { _id: req.params.id, userId: req.user.id, 'shipments.id_distributor': old_id_distributor, 'shipments.id_toko_vendor': old_id_toko_vendor },
                { $set: updateFields },
                { new: true }
            )

            const pengiriman = await Pengiriman.findOneAndUpdate(
                {
                    orderId: updatedOrder._id,
                    productToDelivers: {
                        $elemMatch: {
                            productId: { $in: products }
                        }
                    }
                },
                {
                    distributorId: new_id_distributor,
                    rejected: false,
                    total_ongkir,
                    potongan_ongkir,
                    ongkir,
                    id_jenis_kendaraan,
                    jenis_pengiriman
                }
            );

            return res.status(200).json({data: updatedOrder, pengiriman})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    update_status: async (req, res, next) => {
        try {
            if (!req.body.pesananId || !req.body.status) return res.status(401).json({ message: `Dibutuhkan payload dengan nama pesananId dan status` })
            if (req.body.status !== 'Berhasil') return res.status(400).json({ message: "Status yang dikirimkan tidak valid" })
            const pesanan = await Orders.findById(req.body.pesananId).lean()
            if(!pesanan) return res.status(404).json({message: `Tidak ada pesanan dengan id: ${req.body.pesananId}`})
            const productIds = []
            const ships = []
            pesanan.items.map(item => productIds.push(item.product));
            pesanan.shipments.map(item => ships.push(item))
            if (!pesanan) return res.status(404).json({ message: `pesanan dengan id: ${req.body.pesananID} tidak ditemukan` })
            if (pesanan.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa mengubah data orang lain!" })
            const total_transaksi = await Transaksi.countDocuments({
                createdAt: {
                    $gte: now,
                    $lt: tomorrow
                }
            });
            const writeDb = [
                Orders.updateOne({ _id: pesanan._id }, { status: req.body.status }),
            ]

            // const finalProduct = productIds.map(item => {
            //     return item[0].productId
            // })
            // for (const item of finalProduct) {
            //     const product = await Product.findById(item);
            //     const user_seller = await User.findById(product.userId);
            //     if (user_seller) {
            //         writeDb.push(
            //             Transaksi.create({
            //                 id_pesanan: pesanan._id,
            //                 jenis_transaksi: "masuk",
            //                 status: "Pembayaran Berhasil",
            //                 kode_transaksi: `TRX_${user_seller.kode_role}_IN_SYS_${date}_${minutes}_${total_transaksi + 1}`
            //             }),
            //             Transaksi.create({
            //                 id_pesanan: pesanan._id,
            //                 jenis_transaksi: "keluar",
            //                 status: "Pembayaran Berhasil",
            //                 kode_transaksi: `TRX_SYS_OUT_${user_seller.kode_role}_${date}_${minutes}_${total_transaksi + 1}`
            //             }),
            //         );
            //     }
            // }

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

            const socket = io('https://probable-subtly-crawdad.ngrok-free.app', {
                auth: {
                    fromServer: true
                }
            })

            for (const item of productIds){
                const product = await Product.findById(item);
                socket.emit('notif_pesanan_selesai', {
                    jenis: 'pesanan',
                    userId: pesanan.userId,
                    message: `Pesanan ${product.name_product} telah selesai`,
                    image: product.image_product[0],
                    status: 'pesanan telah selesai',
                    waktu: `${new Date().toLocaleTimeString('en-GB')}`
                });
            }

            await Promise.all(writeDb)
            return res.status(200).json({ message: "Berhasil Merubah Status" })
        } catch (err) {
            console.log(err)
            next(err)
        }
    },

    confirmOrder: async(req, res, next) => {
        try {
            if(req.user.role === 'konsumen') return res.status(403).json({message: "Invalid Request"})
            const { pengirimanId } = req.body
            const pengiriman = await Pengiriman.findByIdAndUpdate(pengirimanId, { sellerApproved: true }, {new :true}).lean();
            if(!pengiriman) return res.status(404).json({message: `Tidak ada pengiriman dengan id ${pengirimanId}`});
            return res.status(200).json({message: "Berhasil Mengkonfirmasi Pesanan"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    
    cancelOrder: async (req, res, next) => {
        try {
            const { pesananId, reason } = req.body
            const order = await Pesanan.findOneAndUpdate({ _id: pesananId, userId: req.user.id }, {
                status: "Dibatalkan",
                reason,
                canceledBy: "pengguna"
            })
            const detailPesanan = await DetailPesanan.exists({id_pesanan: pesananId});
            await axios.post(`https://api.sandbox.midtrans.com/v2/${detailPesanan._id}/cancel`, {}, {
                headers: {
                    Authorization: `Basic ${btoa(process.env.SERVERKEY + ':')}`
                }
            })
            await VA_Used.deleteOne({orderId: pesananId, userId: req.user.id})
            if(!order) return res.status(404).json({message: `Tidak ada order dengan id ${pesananId}`})
            return res.status(200).json({message: "Berhasil Membatalkan Order", data: order})
        } catch (error) {
            console.log(error);
            next(error)
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