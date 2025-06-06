const { io } = require("socket.io-client");
const Orders = require("../models/pesanan/model-orders");
const Product = require("../models/model-product");
const axios = require("axios");
const DetailPesanan = require("../models/model-detail-pesanan");
const VaUser = require("../models/model-user-va");
const VA = require("../models/model-virtual-account");
const VA_Used = require("../models/model-va-used");
const { Transaksi, Transaksi2 } = require("../models/model-transaksi");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TokoVendor = require("../models/vendor/model-toko");
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
const salesReport = require("../utils/checkSalesReport");
const Notifikasi = require("../models/notifikasi/notifikasi");
const DetailNotifikasi = require("../models/notifikasi/detail-notifikasi");
const BiayaTetap = require("../models/model-biaya-tetap");
const Pengemasan = require("../models/model-pengemasan");
const { calculateDistance } = require("../utils/menghitungJarak");
const ProsesPengirimanDistributor = require("../models/distributor/model-proses-pengiriman");
const Distributtor = require("../models/distributor/model-distributor");
const Vendor = require("../models/vendor/model-vendor");
const IncompleteOrders = require("../models/pesanan/model-incomplete-orders");
const PinaltiVendor = require("../models/vendor/model-pinaltiVendor");
const PanduanPembayaran = require("../models/model-panduan-pembayaran");
const PoinHistory = require("../models/model-poin");
const JenisJasaDistributor = require("../models/distributor/jenisJasaDistributor");
const TokoSupplier = require("../models/supplier/model-toko");
const TokoProdusen = require("../models/produsen/model-toko");
const Supplier = require("../models/supplier/model-supplier");
const Konsumen = require("../models/konsumen/model-konsumen");
const PelacakanDistributorKonsumen = require("../models/konsumen/pelacakanDistributorKonsumen");
const ReviewProduk = require("../models/model-review/model-reviewProduk");
const ReviewDistributor = require("../models/distributor/model-reviewDistributor");
dotenv.config();

const now = new Date();
now.setHours(0, 0, 0, 0);
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
const today = new Date();

const dd = String(today.getDate()).padStart(2, "0");
const mm = String(today.getMonth() + 1).padStart(2, "0");
const yyyy = today.getFullYear();

const hh = String(today.getHours()).padStart(2, "0");
const mn = String(today.getMinutes()).padStart(2, "0");
const ss = String(today.getSeconds()).padStart(2, "0");
const date = `${yyyy}${mm}${dd}`;
const minutes = `${hh}${mn}${ss}`;

function formatTanggal(tanggal) {
  const dd = String(tanggal.getDate()).padStart(2, "0");
  const mm = String(tanggal.getMonth() + 1).padStart(2, "0");
  const yyyy = tanggal.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function formatWaktu(waktu) {
  const hh = String(waktu.getHours()).padStart(2, "0");
  const mn = String(waktu.getMinutes()).padStart(2, "0");
  return `${hh}:${mn}`;
}

function formatTanggalBulan(date) {
  const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const tanggal = date.getDate();
  const bulanIndex = date.getMonth();
  const tahun = date.getFullYear();

  return `${tanggal} ${bulan[bulanIndex]} ${tahun}`;
}

const socket = io(process.env.WEBSOCKET, {
  auth: {
    fromServer: true,
  },
});

module.exports = {
  getOrderPanel: async (req, res, next) => {
    try {
      const datas = await Orders.find()
        .populate({
          path: "product.productId",
          populate: {
            path: "categoryId",
          },
          populate: {
            path: "userId",
            select: "-password",
          },
        })
        .populate("userId", "-password")
        .populate("addressId");

      res.status(200).json({
        message: "Success get data orders",
        datas,
      });
    } catch (error) {
      console.log(error);
      if (error && error.name === "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      next(error);
    }
  },

  getOrders: async (req, res, next) => {
    try {
      const { page = 1, limit = 5 } = req.query;
      const skip = (page - 1) * limit;
      const filter = {
        userId: new mongoose.Types.ObjectId(req.user.id),
      };
      const dataOrders = await Orders.aggregate([
        { $match: filter },
        {
          $project: {
            items: 1,
            status: 1,
            createdAt: 1,
            expire: 1,
            biaya_layanan: 1,
            biaya_jasa_aplikasi: 1,
            biaya_asuransi: 1,
            biaya_awal_asuransi: 1,
            sekolahId: 1,
          },
        },
        {
          $lookup: {
            from: "detailpesanans",
            let: { orderId: "$_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$id_pesanan", "$$orderId"] } } }, { $project: { _id: 1, total_price: 1 } }],
            as: "detail_pesanan",
          },
        },
        { $unwind: "$detail_pesanan" },
        { $addFields: { total_pesanan: "$detail_pesanan.total_price" } },
        { $unwind: "$items" },
        { $unwind: "$items.product" },
        {
          $lookup: {
            from: "products",
            let: { productIds: "$items.product.productId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productIds"] } } }, { $project: { _id: 1, name_product: 1, image_product: 1, categoryId: 1, userId: 1, total_price: 1 } }],
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        { $addFields: { "items.product.productId": "$productInfo" } },
        {
          $lookup: {
            from: "users",
            let: { userId: { $toObjectId: "$items.product.productId.userId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, { $project: { _id: 1, role: 1 } }],
            as: "user_details",
          },
        },
        { $unwind: "$user_details" },
        { $addFields: { "items.product.productId.userId": "$user_details" } },
        {
          $lookup: {
            from: "specificcategories",
            localField: "items.product.productId.categoryId",
            foreignField: "_id",
            as: "category_details",
          },
        },
        { $unwind: "$category_details" },
        { $addFields: { "items.product.productId.categoryId": "$category_details" } },
        { $project: { productInfo: 0, category_details: 0 } },
        {
          $group: {
            _id: "$_id",
            items: {
              $push: {
                product: "$items.product",
                deadline: "$items.deadline",
                kode_pesanan: "$items.kode_pesanan",
              },
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
            sudah_direview: { $first: "$sudah_direview" },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]).skip(skip).limit(parseInt(limit));

      if (!dataOrders || dataOrders.length < 1) {
        return res.status(200).json({ message: `anda belom memiliki ${req.user.role === "konsumen" ? "order" : "orderan"}` });
      }

      let data = [];
      let totalPriceVendor = 0;

      for (const order of dataOrders) {
        let { items, status, total_pesanan, biaya_asuransi, biaya_awal_asuransi, ...rest } = order;
        const transaksi = await Transaksi.exists({ id_pesanan: order._id, subsidi: false });
        const transaksiSubsidi = await Transaksi.exists({ id_pesanan: order._id, subsidi: true });
        const sekolah = await Sekolah.findOne({ _id: order.sekolahId, userId: req.user.id }).select("jumlahMurid").lean();
        if (!sekolah && req.user.role === "konsumen") return res.status(404).json({ message: "Sekolah tidak ditemukan, akan segera diperbaiki" });
        let sisaSubsidi = sekolah?.jumlahMurid;
        const addedPengiriman = new Set();
        const dataProduct = await DataProductOrder.findOne({ pesananId: order._id });
        if (order.status === "Belum Bayar" || order.status === "Dibatalkan") {
          if (transaksi && transaksiSubsidi && req.user.role === "konsumen") {
            if (transaksiSubsidi) {
              const store = {};
              const invoice = await Invoice.findOne({ id_transaksi: transaksiSubsidi._id }).lean();
              let jumlah_uang = 0;
              const pengiriman = await Pengiriman.find({ invoice: invoice._id }).populate("distributorId").populate("id_jenis_kendaraan").lean();
              for (const item of order.items) {
                const { productId, quantity, ...restOfProduct } = item.product;
                const productSelected = dataProduct.dataProduct.find((prod) => prod._id.toString() === item.product.productId._id);
                if (productSelected && sisaSubsidi >= 0) {
                  processed = true; // Mark as processed

                  let detailToko;
                  const storeId = item.product.productId.userId._id.toString();
                  switch (item.product.productId.userId.role) {
                    case "vendor":
                      detailToko = await TokoVendor.findOne({ userId: storeId }).select("namaToko");
                      break;
                    case "supplier":
                      detailToko = await Supplier.findOne({ userId: storeId });
                      break;
                    case "produsen":
                      detailToko = await Produsen.findOne({ userId: storeId });
                      break;
                  }

                  const selectedPengiriman = pengiriman.find((pgr) => {
                    return pgr.productToDelivers.some((prd) => productSelected._id.toString() === prd.productId.toString());
                  });

                  if (!selectedPengiriman) {
                    continue;
                  }
                  const totalQuantity = selectedPengiriman.productToDelivers.find((ship) => ship.productId.toString() === productSelected._id.toString());
                  let itemTotal = productSelected.total_price * totalQuantity.quantity;
                  totalPriceVendor += itemTotal;
                  jumlah_uang += itemTotal;

                  if (order.biaya_asuransi) {
                    jumlah_uang += biaya_awal_asuransi * totalQuantity.quantity;
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
                        namaToko: detailToko.namaToko,
                      },
                      status_pengiriman: [selectedPengiriman],
                      totalHargaProduk: 0,
                      arrayProduct: [],
                    };
                  }
                  store[storeId].totalHargaProduk += itemTotal;
                  store[storeId].total_pesanan += jumlah_uang;
                  store[storeId].arrayProduct.push({ productId: productSelected, ...restOfProduct, quantity: totalQuantity.quantity });
                  sisaSubsidi -= totalQuantity.quantity;
                  jumlah_uang = 0;
                }
              }
              Object.keys(store).forEach((key) => {
                const { totalHargaProduk, total_pesanan, ...restOfStore } = store[key];
                const rasioJasaAplikasi = Math.round((totalHargaProduk / totalPriceVendor) * order.biaya_jasa_aplikasi);
                const rasioBiayaLayanan = Math.round((totalHargaProduk / totalPriceVendor) * order.biaya_layanan);
                const jumlah = total_pesanan + rasioJasaAplikasi + rasioBiayaLayanan;
                data.push({
                  ...rest,
                  status: store[key].status_pengiriman[0].isBuyerAccepted ? "Berhasil" : "Berlangsung",
                  total_pesanan: jumlah,
                  ...restOfStore,
                });
              });
            }

            if (transaksi) {
              const invoice = await Invoice.findOne({ id_transaksi: transaksi._id });
              let jumlah_uang = order.biaya_layanan + order.biaya_jasa_aplikasi;
              const pengiriman = await Pengiriman.find({ invoice: invoice._id }).populate("distributorId").populate("id_jenis_kendaraan").lean();
              const store = {};
              for (const item of order.items) {
                const { productId, quantity, ...restOfProduct } = item.product;
                let detailToko;
                const storeId = item.product.productId.userId._id.toString();

                switch (item.product.productId.userId.role) {
                  case "vendor":
                    detailToko = await TokoVendor.findOne({ userId: storeId }).select("namaToko");
                    break;
                  case "supplier":
                    detailToko = await TokoSupplier.findOne({ userId: storeId });
                    break;
                  case "produsen":
                    detailToko = await Produsen.findOne({ userId: storeId });
                    break;
                }

                const selectedPengiriman = pengiriman.find((pgr) => {
                  const found = pgr.productToDelivers.some((prd) => {
                    return item.product.productId._id.toString() === prd.productId.toString();
                  });
                  return found;
                });

                if (!selectedPengiriman) {
                  continue;
                }

                const totalQuantity = selectedPengiriman.productToDelivers.find((ship) => ship.productId.toString() === item.product.productId._id.toString());
                let itemTotal = item.product.productId.total_price * totalQuantity.quantity;
                if (order.biaya_asuransi) jumlah_uang += order.biaya_awal_asuransi * totalQuantity.quantity;
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
                      namaToko: detailToko.namaToko,
                    },
                    status_pengiriman: selectedPengiriman,
                    arrayProduct: [],
                  };
                }

                store[storeId].arrayProduct.push({ productId: item.product.productId, ...restOfProduct, quantity: totalQuantity.quantity });
              }
              const orders = Object.keys(store).map((key) => {
                return store[key];
              });
              data.push({ ...rest, total_pesanan: jumlah_uang, status: "Belum Bayar", orders });
            }
          }

          if (req.user.role !== "konsumen") {
            const invoice = await Invoice.findOne({ id_transaksi: transaksi?._id });
            let jumlah_uang = order.biaya_layanan + order.biaya_jasa_aplikasi;
            const pengiriman = await Pengiriman.find({ invoice: invoice._id }).populate("distributorId").populate("id_jenis_kendaraan").lean();
            const store = {};
            for (const item of order.items) {
              const { productId, quantity, ...restOfProduct } = item.product;
              let detailToko;
              const storeId = item.product.productId.userId._id.toString();

              switch (item.product.productId.userId.role) {
                case "vendor":
                  detailToko = await TokoVendor.findOne({ userId: storeId }).select("namaToko");
                  break;
                case "supplier":
                  detailToko = await TokoSupplier.findOne({ userId: storeId }).select("namaToko");
                  break;
                case "produsen":
                  detailToko = await TokoProdusen.findOne({ userId: storeId }).select("namaToko");
                  break;
              }

              const selectedPengiriman = pengiriman.find((pgr) => {
                const found = pgr.productToDelivers.some((prd) => {
                  return item.product.productId._id.toString() === prd.productId.toString();
                });
                return found;
              });

              if (!selectedPengiriman) {
                continue;
              }

              const totalQuantity = selectedPengiriman.productToDelivers.find((ship) => ship.productId.toString() === item.product.productId._id.toString());
              let itemTotal = item.product.productId.total_price * totalQuantity.quantity;
              if (order.biaya_asuransi) jumlah_uang += order.biaya_awal_asuransi * totalQuantity.quantity;
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
                    namaToko: detailToko.namaToko,
                  },
                  status_pengiriman: selectedPengiriman,
                  arrayProduct: [],
                };
              }

              store[storeId].arrayProduct.push({ productId: item.product.productId, ...restOfProduct, quantity: totalQuantity.quantity });
            }
            const orders = Object.keys(store).map((key) => {
              return store[key];
            });
            data.push({ ...rest, total_pesanan: jumlah_uang, status: "Belum Bayar", orders });
          }
        } else {
          let jumlah_uang = 0;
          const store = {};
          const invoiceSubsidi = await Invoice.exists({ id_transaksi: transaksiSubsidi?._id });
          const invoiceTambahan = await Invoice.exists({ id_transaksi: transaksi?._id });
          const pengiriman = await Pengiriman.find({ orderId: order._id }).populate("distributorId").populate("id_jenis_kendaraan").lean();
          let totalProductTambahan = 0;
          let totalProductSubsidi = 0;
          for (const item of order.items) {
            const { productId, quantity, ...restOfProduct } = item.product;
            const productSelected = dataProduct.dataProduct.find((prod) => prod._id.toString() === item.product.productId._id);
            if (productSelected) {
              processed = true;

              let detailToko;
              const storeId = productSelected.userId._id.toString();
              switch (productSelected.userId.role) {
                case "vendor":
                  detailToko = await TokoVendor.findOne({ userId: storeId }).select("namaToko");
                  break;
                case "supplier":
                  detailToko = await TokoSupplier.findOne({ userId: storeId });
                  break;
                case "produsen":
                  detailToko = await TokoProdusen.findOne({ userId: storeId });
                  break;
              }

              const selectedPengiriman = pengiriman.filter((pgr) => {
                return pgr.productToDelivers.some((prd) => productSelected._id.toString() === prd.productId.toString());
              });

              let totalQuantity = 0;

              if (!store[storeId]) {
                store[storeId] = {
                  total_pesanan: 0,
                  seller: {
                    _id: item.product.productId.userId._id,
                    idToko: detailToko._id,
                    namaToko: detailToko.namaToko,
                  },
                  status_pengiriman: selectedPengiriman,
                  totalHargaSubsidi: 0,
                  totalHargaTambahan: 0,
                  arrayProduct: [],
                };
              }

              selectedPengiriman.map((pgr) => {
                pgr.productToDelivers.map((prd) => {
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

              if (order.biaya_asuransi) {
                jumlah_uang += biaya_awal_asuransi * totalQuantity;
              }
              store[storeId].total_pesanan += jumlah_uang;
              store[storeId].arrayProduct.push({ productId: productSelected, ...restOfProduct, quantity: totalQuantity });
              jumlah_uang = 0;
            }
          }
          // Object.keys(store).forEach((key) => );
          // formm
          for(const key of Object.keys(store)){
            let jumlah = 0;
            const { totalHargaSubsidi, totalHargaTambahan, status_pengiriman, total_pesanan, ...restOfStore } = store[key];
            const isSellerReviewed = await ReviewProduk.exists({pengirimanId: { $in: status_pengiriman.map(pgr => pgr._id )}});
            const isDistriReviewed = await ReviewDistributor.exists({pengirimanId: { $in: status_pengiriman.map(pgr => pgr._id )}});
            if (totalHargaTambahan > 0) {
              const rasio = totalHargaTambahan / totalProductTambahan;
              jumlah += Math.round(rasio * order.biaya_jasa_aplikasi) + Math.round(rasio * order.biaya_layanan);
            }
            if (totalHargaSubsidi > 0) {
              const rasio = totalHargaSubsidi / totalProductSubsidi;
              jumlah += Math.round(rasio * order.biaya_jasa_aplikasi) + Math.round(rasio * order.biaya_layanan);
            }
            const incomplete = await IncompleteOrders.findOne({ pengirimanId: status_pengiriman[0]._id });
            const statusOrder = () => {
              const isAccepted = status_pengiriman.some((pgr) => pgr.isBuyerAccepted);
              return isAccepted ? "Berhasil" : status;
            };
            data.push({
              ...rest,
              status: statusOrder(),
              total_pesanan: total_pesanan + jumlah,
              status_pengiriman,
              ...restOfStore,
              incomplete: incomplete ? 
              {
                status: true,
                message: `${store[key].arrayProduct[0].productId.name_product} yang bisa dipenuhi hanya ${incomplete.persentase}%. Mohon penuhi kekurangannya.`,
              } : 
              {
                status: false,
                message: ``
              },
              reviewed: {
                produkReviewed: isSellerReviewed? true : false,
                distriReviewed: isDistriReviewed? true : false
              }
            });
          }
        }
      }
      const filteredData = data
        .filter((ord) => {
          if (!req.query.status) return true;
          return ord.status.toLowerCase() === req.query.status.toLowerCase();
        })
        .sort((a, b) => {
          if (a.status === "Belum Bayar" && b.status !== "Belum Bayar") {
            return -1;
          }
          if (a.status !== "Belum Bayar" && b.status === "Belum Bayar") {
            return 1;
          }
          return 0;
        })
      return res.status(200).json({ message: "get data all Order success", data: filteredData });
    } catch (error) {
      console.log(error)
      if (error && error.name === "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      next(error);
    }
  },

  getOrdersSeller: async (req, res, next) => {
    try {
      const { status, page = 1, limit = 5 } = req.query;
      const skip = (page - 1) * limit;
      if (req.user.role === "konsumen") return res.status(403).json({ message: "Invalid Request" });
      const products = await Product.find({ userId: req.user.id });
      const productIds = products.map((item) => {
        return item._id;
      });

      const filter = {
        items: {
          $elemMatch: {
            product: {
              $elemMatch: {
                productId: { $in: productIds },
              },
            },
          },
        },
      };

      const pipeline = [
        { $match: filter },
        { $unwind: "$items" },
        {
          $addFields: {
            "items.product": {
              $filter: {
                input: "$items.product",
                as: "product",
                cond: { $in: ["$$product.productId", productIds] },
              },
            },
          },
        },
        { $match: { "items.product": { $not: { $size: 0 } } } },
        { $project: { shipments: 0 } },
        { $unwind: "$items.product" },
        {
          $lookup: {
            from: "addresses",
            foreignField: "_id",
            localField: "addressId",
            as: "alamat",
          },
        },
        { $unwind: "$alamat" },
      ];

      if (req.user.role === "vendor") {
        pipeline.push(
          {
            $lookup: {
              from: "sekolahs",
              foreignField: "_id",
              localField: "sekolahId",
              as: "sekolah",
            },
          },
          { $unwind: "$sekolah" }
        );
      }

      pipeline.push(
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
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        }
      );

      dataOrders = await Pesanan.aggregate(pipeline).skip(skip).limit(parseInt(limit));

      const data = [];
      for (const order of dataOrders) {
        const { createdAt, updatedAt, status, items, biaya_layanan, biaya_jasa_aplikasi, poinTerpakai, biaya_asuransi, biaya_awal_asuransi, biaya_awal_proteksi, dp, ...restOfOrder } = order;
        const dataProd = await DataProductOrder.findOne({ pesananId: order._id });
        const transaksiSubsidi = await Transaksi.findOne({ id_pesanan: order._id, subsidi: true });
        const transaksiTambahan = await Transaksi.findOne({ id_pesanan: order._id, subsidi: false });
        const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksiSubsidi?._id });
        const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksiTambahan?._id, status: "Lunas" });
        const pengiriman = await Pengiriman.find({ orderId: order._id }).populate("distributorId").lean();
        const proses = await ProsesPengirimanDistributor.exists({ pengirimanId: { $in: pengiriman.map((pgr) => pgr._id) }, status_distributor: { $ne: "Belum dijemput" } });
        if (!proses) {
          let detailBuyer;
          const detailUserBuyer = await User.findById(order.alamat.userId);
          switch (detailUserBuyer.role) {
            case "konsumen":
              detailBuyer = await Konsumen.findOne({ userId: detailUserBuyer._id }).select("nama namaBadanUsaha");
              break;
            case "vendor":
              detailBuyer = await Vendor.findOne({ userId: detailUserBuyer._id }).select("nama namaBadanUsaha");
              break;
            case "supplier":
              detailBuyer = await Supplier.findOne({ userId: detailUserBuyer._id }).select("nama namaBadanUsaha");
              break;
          }
          console.log(order.alamat.userId);
          const pesanan = {};
          const kode_pesanan = new Set();
          for (const item of order.items) {
            let isApproved = item.isApproved;
            const productSelected = dataProd?.dataProduct.find((prd) => item.product.productId.toString() === prd._id.toString());
            if (!kode_pesanan.has(item.kode_pesanan)) {
              kode_pesanan.add(item.kode_pesanan);
            }
            if (productSelected) {
              const selectedPengiriman = pengiriman.filter((pgr) => {
                return pgr.productToDelivers.some((prd) => prd.productId.toString() === productSelected._id.toString());
              });

              selectedPengiriman.map((pgr) => {
                const pgrId = pgr._id.toString();
                const isDistributtorApprovedCheck = () => {
                  if (item.isDistributtorApproved) {
                    return true;
                  } else if (!item.isDistributtorApproved) {
                    return null;
                  } else if (pgr.rejected) {
                    return false;
                  }
                };

                if (pgr.invoice.toString() === invoiceSubsidi?._id.toString()) {
                  if (!pesanan[pgrId]) {
                    pesanan[pgrId] = {
                      pengiriman: pgr,
                      isApproved,
                      isDistributtorApproved: isDistributtorApprovedCheck(),
                      product: [],
                    };
                  }
                  const found = pgr.productToDelivers.find((prd) => prd.productId.toString() === productSelected._id.toString());
                  pesanan[pgrId].product.push({
                    product: productSelected,
                    quantity: found.quantity,
                    totalHargaProduk: productSelected.total_price * found.quantity,
                    total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0,
                  });
                }

                if (pgr.invoice.toString() === invoiceTambahan?._id.toString()) {
                  if (!pesanan[pgrId]) {
                    pesanan[pgrId] = {
                      pengiriman: pgr,
                      isApproved,
                      isDistributtorApproved: isDistributtorApprovedCheck(),
                      product: [],
                    };
                  }
                  const found = pgr.productToDelivers.find((prd) => prd.productId.toString() === productSelected._id.toString());
                  pesanan[pgrId].product.push({
                    product: productSelected,
                    quantity: found.quantity,
                    totalHargaProduk: productSelected.total_price * found.quantity,
                    total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0,
                  });
                }
              });
            }
          }

          for (const key of Object.keys(pesanan)) {
            const pembatalan = await Pembatalan.findOne({ pengirimanId: pesanan[key].pengiriman._id });
            const tidakMemenuhiSyarat = await IncompleteOrders.exists({
              userIdSeller: req.user.id,
              pengirimanId: pesanan[key].pengiriman._id,
              userIdKonsumen: restOfOrder?.sekolah?.userId,
            });
            const checkStatus = () => {
              if (pesanan[key].pengiriman.isRequestedToPickUp && !pembatalan) {
                return "Menunggu Distributor";
              }
              if (pesanan[key].pengiriman.sellerApproved && !pembatalan) {
                return "Dikemas";
              }
              if (!pesanan[key].pengiriman.sellerApproved && !pembatalan) {
                return "Pesanan Terbaru";
              }
              if (pesanan[key].pengiriman.status_pengiriman === "dikirim" && !pembatalan) {
                return "Sedang Penjemputan";
              }
              if (pembatalan) {
                return "Kadaluarsa";
              }
              if(tidakMemenuhiSyarat){
                return "Tidak Memenuhi Syarat"
              }
            };
            const checkCreatedAt = () => {
              if (pesanan[key].pengiriman.invoice._id.toString() === invoiceSubsidi?._id.toString()) {
                return createdAt;
              }
              if (pesanan[key].pengiriman.invoice._id.toString() === invoiceTambahan?._id.toString()) {
                return updatedAt;
              }
            };
            const { pengiriman, ...restOfPesanan } = pesanan[key];
            const { waktu_pengiriman, countdown_pengemasan_vendor, ...restOfPengiriman } = pengiriman;
            data.push({
              ...restOfOrder,
              createdAt: checkCreatedAt(),
              status: checkStatus(),
              id_pesanan: Array.from(kode_pesanan)[0],
              detailBuyer,
              pengiriman: {
                ...restOfPengiriman,
                countdown_pengemasan_vendor: countdown_pengemasan_vendor ? new Date(countdown_pengemasan_vendor) : null,
                waktu_pengiriman: new Date(waktu_pengiriman),
              },
              ...restOfPesanan,
            });
          }
        }
      }

      let filteredData = data.filter((dt) => {
        if (!status) return true;
        return dt.status.toLowerCase() === status.toLowerCase();
      });

      return res.status(200).json({ message: "get data all Order success", data: filteredData });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  automaticVendorOrderCancel: async (req, res, next) => {
    try {
      const products = await Product.find();
      const productIds = products.map((item) => item._id);

      const filter = {
        items: {
          $elemMatch: {
            product: {
              $elemMatch: {
                productId: { $in: productIds },
              },
            },
          },
        },
      };

      const dataOrders = await Pesanan.aggregate([
        { $match: filter },
        { $unwind: "$items" },
        {
          $addFields: {
            "items.product": {
              $filter: {
                input: "$items.product",
                as: "product",
                cond: { $in: ["$$product.productId", productIds] },
              },
            },
          },
        },
        { $match: { "items.product": { $not: { $size: 0 } } } },
        { $project: { shipments: 0 } },
        { $unwind: "$items.product" },
        {
          $lookup: {
            from: "addresses",
            foreignField: "_id",
            localField: "addressId",
            as: "alamat",
          },
        },
        { $unwind: "$alamat" },
        {
          $lookup: {
            from: "sekolahs",
            foreignField: "_id",
            localField: "sekolahId",
            as: "sekolah",
          },
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
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
      for (const order of dataOrders) {
        const { userId, createdAt, updatedAt, status, items, biaya_layanan, biaya_jasa_aplikasi, poinTerpakai, biaya_asuransi, biaya_awal_asuransi, biaya_awal_proteksi, dp, ...restOfOrder } = order;
        const dataProd = await DataProductOrder.findOne({ pesananId: order._id });
        const transaksiSubsidi = await Transaksi.findOne({ id_pesanan: order._id, subsidi: true });
        const transaksiTambahan = await Transaksi.findOne({ id_pesanan: order._id, subsidi: false });
        const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksiSubsidi?._id });
        const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksiTambahan?._id, status: "Lunas" });
        const pengiriman = await Pengiriman.find({ orderId: order._id, sellerApproved: false }).populate("distributorId").lean();
        let detailToko;

        const pesanan = {};
        // const kode_pesanan = new Set()
        for (const item of order.items) {
          let isApproved = item.isApproved;
          const productSelected = dataProd?.dataProduct.find((prd) => item.product.productId.toString() === prd._id.toString());
          // if(!kode_pesanan.has(item.kode_pesanan)){
          //     kode_pesanan.add(item.kode_pesanan)
          // }
          if (productSelected) {
            const selectedPengiriman = pengiriman.filter((pgr) => {
              return pgr.productToDelivers.some((prd) => prd.productId.toString() === productSelected._id.toString());
            });

            selectedPengiriman.map((pgr) => {
              const pgrId = pgr._id.toString();
              const isDistributtorApprovedCheck = () => {
                if (item.isDistributtorApproved) {
                  return true;
                } else if (!item.isDistributtorApproved) {
                  return null;
                } else if (pgr.rejected) {
                  return false;
                }
              };

              if (pgr.invoice.toString() === invoiceSubsidi._id.toString()) {
                if (!pesanan[pgrId]) {
                  pesanan[pgrId] = {
                    pengiriman: pgr,
                    isApproved,
                    isDistributtorApproved: isDistributtorApprovedCheck(),
                    product: [],
                  };
                }
                const found = pgr.productToDelivers.find((prd) => prd.productId.toString() === productSelected._id.toString());
                pesanan[pgrId].product.push({
                  product: productSelected,
                  quantity: found.quantity,
                  totalHargaProduk: productSelected.total_price * found.quantity,
                  total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0,
                });
              }

              if (pgr.invoice.toString() === invoiceTambahan?._id.toString()) {
                if (!pesanan[pgrId]) {
                  pesanan[pgrId] = {
                    pengiriman: pgr,
                    isApproved,
                    isDistributtorApproved: isDistributtorApprovedCheck(),
                    product: [],
                  };
                }
                const found = pgr.productToDelivers.find((prd) => prd.productId.toString() === productSelected._id.toString());
                pesanan[pgrId].product.push({
                  product: productSelected,
                  quantity: found.quantity,
                  totalHargaProduk: productSelected.total_price * found.quantity,
                  total_biaya_asuransi: biaya_asuransi ? biaya_awal_asuransi * found.quantity : 0,
                });
              }
            });
          }
        }

        for (const key of Object.keys(pesanan)) {
          const checkCreatedAt = () => {
            if (pesanan[key].pengiriman.invoice._id.toString() === invoiceSubsidi._id.toString()) {
              return createdAt;
            } else if (pesanan[key].pengiriman.invoice._id.toString() === invoiceTambahan._id.toString()) {
              return updatedAt;
            }
          };

          const created = checkCreatedAt();
          const sixHoursAgo = new Date(new Date().getTime() - 6 * 60 * 60 * 1000);
          const toko = await TokoVendor.findById(pesanan[key].pengiriman.id_toko).select("userId");
          await PinaltiVendor.create({
            id_user_vendor: toko.userId,
            alasan_pinalti: "Tidak Mengkonfirmasi Pesanan",
            poin_pinalti: 2,
          });
          if (created < sixHoursAgo) {
            await Pengiriman.findByIdAndUpdate(pesanan[key].pengiriman._id, {
              canceled: true,
              canceledBy: "sistem",
              userId,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  getOrderDetail: async (req, res, next) => {
    try {
      const { sellerId, status_order } = req.query;
      const isKonsumen = req.user.role === "konsumen";
      const pipeline = [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
            userId: new mongoose.Types.ObjectId(req.user.id),
          },
        },
        {
          $project: {
            shipments: 0,
          },
        },
        {
          $lookup: {
            from: "detailpesanans",
            foreignField: "id_pesanan",
            localField: "_id",
            as: "order_detail",
          },
        },
        {
          $unwind: "$order_detail",
        },
        {
          $unwind: "$items",
        },
        {
          $unwind: "$items.product",
        },
        {
          $lookup: {
            from: "products",
            let: { productId: "$items.product.productId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }, { $project: { name_product: 1, image_product: 1, userId: 1, total_price: 1 } }],
            as: "product_detail",
          },
        },
        { $unwind: "$product_detail" },
        { $addFields: { "items.product.productId": "$product_detail" } },
        { $project: { product_detail: 0 } },
        {
          $lookup: {
            from: "users",
            let: { userId: "$items.product.productId.userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, { $project: { role: 1, _id: 1 } }],
            as: "user_detail",
          },
        },
        { $unwind: "$user_detail" },
        { $addFields: { "items.product.productId.userId": "$user_detail" } },
        { $project: { user_detail: 0 } },
        {
          $lookup: {
            from: "addresses",
            foreignField: "_id",
            localField: "addressId",
            as: "alamat",
          },
        },
        { $unwind: "$alamat" },
        { $addFields: { addressId: "$alamat" } },
        { $project: { alamat: 0 } },
      ];

      // Conditionally add the sekolah lookup stages if the user role is 'konsumen'
      if (isKonsumen) {
        pipeline.push(
          {
            $lookup: {
              from: "sekolahs",
              foreignField: "_id",
              localField: "sekolahId",
              as: "sekolahId",
            },
          },
          { $unwind: "$sekolahId" },
          {
            $lookup: {
              from: "addresses",
              foreignField: "_id",
              localField: "sekolahId.address",
              as: "alamatSekolah",
            },
          },
          { $unwind: "$alamatSekolah" },
          { $addFields: { "sekolahId.address": "$alamatSekolah" } }
        );
      }

      pipeline.push(
        {
          $group: {
            _id: "$_id",
            items: {
              $push: {
                product: "$items.product",
                deadline: "$items.deadline",
                kode_pesanan: "$items.kode_pesanan",
              },
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
            sekolahId: { $first: "$sekolahId" },
          },
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
              biaya_layanan: "$biaya_layanan",
              biaya_jasa_aplikasi: "$biaya_jasa_aplikasi",
              createdAt: "$createdAt",
              dp: "$dp",
              biaya_asuransi: "$biaya_asuransi",
              sekolahId: "$sekolahId",
            },
          },
        },
        { $replaceRoot: { newRoot: "$data" } }
      );
      const dataOrder = await Orders.aggregate(pipeline);
      // return res.status(200).json({dataOrder})
      if (!dataOrder[0]) return res.status(404).json({ message: `Order dengan id: ${req.params.id} tidak ditemukan` });
      const { _id, items, order_detail, addressId, status, biaya_layanan, biaya_jasa_aplikasi, biaya_asuransi, ...restOfOrder } = dataOrder[0];

      const transaksi = await Transaksi.findOne({ id_pesanan: _id, subsidi: false });
      const transaksiSubsidi = await Transaksi.exists({ id_pesanan: _id, subsidi: true });

      const promises = Object.keys(order_detail).map(async (key) => {
        const paymentMethods = ["id_va", "id_wallet", "id_gerai_tunai", "id_fintech"];
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
      const paymentMethod = await Promise.all(promises);
      const data = [];
      const detailBiaya = {
        total_harga_produk: 0,
        total_ongkir: 0,
        total_potongan_ongkir: 0,
        total_asuransi: 0,
        total_proteksi: 0,
      };
      const addedPengiriman = new Set();
      if ((dataOrder[0].status === "Belum Bayar" && status_order === "Belum Bayar") || dataOrder[0].status === "Dibatalkan") {
        const store = {};
        const pembatalan = await Pembatalan.findOne({ transaksiId: transaksi._id });
        const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi._id, status: "Belum Lunas" }).lean();
        const pengiriman = await Pengiriman.find({
          orderId: req.params.id,
          invoice: invoiceTambahan._id,
        })
          .populate("distributorId")
          .populate("jenis_pengiriman")
          .populate("id_jenis_kendaraan")
          .lean();
        let jumlah_uang = biaya_layanan + biaya_jasa_aplikasi;
        for (const item of dataOrder[0].items) {
          const { product, ...restOfItem } = item;
          const { productId, quantity, ...restOfItemProduct } = item.product;
          const selectedPengiriman = pengiriman.find((pgr) => {
            return pgr.productToDelivers.some((prd) => {
              return prd.productId === productId._id;
            });
          });
          if (!selectedPengiriman) continue;
          switch (productId.userId.role) {
            case "vendor":
              detailToko = await TokoVendor.findOne({ userId: productId.userId._id }).select("namaToko address").populate("address").lean();
              break;
            case "supplier":
              detailToko = await TokoSupplier.findOne({ userId: productId.userId._id }).select("namaToko address").populate("address").lean();
              break;
            case "produsen":
              detailToko = await TokoProdusen.findOne({ userId: productId.userId._id }).select("namaToko address").populate("address").lean();
              break;
          }
          const user = await User.findById(productId.userId._id).select("email phone").lean();
          const storeId = productId.userId._id;
          const totalQuantity = selectedPengiriman.productToDelivers.find((prod) => {
            return prod.productId === productId._id;
          }, 0);
          const pgrIdStr = selectedPengiriman._id.toString();
          if (!addedPengiriman.has(pgrIdStr)) {
            jumlah_uang += selectedPengiriman.total_ongkir;
            detailBiaya.total_ongkir += selectedPengiriman.total_ongkir;
            detailBiaya.total_potongan_ongkir += selectedPengiriman.potongan_ongkir ? selectedPengiriman.potongan_ongkir : 0;
            addedPengiriman.add(pgrIdStr);
          }

          if (biaya_asuransi) {
            jumlah_uang += dataOrder[0].biaya_awal_asuransi * totalQuantity.quantity;
            detailBiaya.total_asuransi += dataOrder[0].biaya_awal_asuransi * totalQuantity.quantity;
          }
          const totalItem = totalQuantity.quantity * productId.total_price;
          detailBiaya.total_harga_produk += totalItem;
          jumlah_uang += totalItem;
          if (!store[storeId]) {
            store[storeId] = {
              toko: {
                userIdSeller: user._id,
                email: user.email.content,
                phone: user.phone.content,
                ...detailToko,
                ...restOfItem,
                status_pengiriman: [selectedPengiriman],
              },
              products: [],
            };
          }
          store[storeId].products.push({ ...productId, ...restOfItemProduct, quantity: totalQuantity.quantity });
        }
        const pay = paymentMethod.find((item) => {
          return item !== null;
        });
        const paymentNumber = await VirtualAccountUser.findOne({ userId: req.user.id, nama_bank: pay._id }).select("nomor_va").lean();
        Object.keys(store).forEach((key) => {
          data.push(store[key]);
        });
        return res.status(200).json({
          message: "get detail data order success",
          _id,
          alamatUser: addressId,
          order_detail,
          total_pesanan: jumlah_uang,
          status: pembatalan ? "Dibatalkan" : status,
          dibatalkanOleh: pembatalan ? pembatalan.canceledBy : null,
          invoice: { ...invoiceTambahan, paymentMethod: pay.nama_bank },
          ...restOfOrder,
          kode_transaksi: transaksi.kode_transaksi,
          biaya_layanan,
          biaya_jasa_aplikasi,
          ...detailBiaya,
          data,
        });
      } else {
        const store = {};
        const transaksiOrder = await Transaksi.find({ id_pesanan: req.params.id });
        const pay = paymentMethod.find((item) => {
          return item !== null;
        });
        const detailInvoiceTambahan = {
          product: [],
          totalHargaProduk: 0,
          totalOngkir: 0,
          totalDiskon: 0,
          asuransiPengiriman: 0,
          totalPotonganOngkir: 0,
          biaya_layanan: 0,
          biaya_jasa_aplikasi: 0,
          paymentMethod: pay?.nama_bank,
        };
        const detailInvoiceSubsidi = {
          product: [],
          totalHargaProduk: 0,
          totalOngkir: 0,
          totalDiskon: 0,
          asuransiPengiriman: 0,
          totalPotonganOngkir: 0,
          biaya_layanan: 0,
          biaya_jasa_aplikasi: 0,
          paymentMethod: "subsidi",
        };
        const invoiceSubsidi = await Invoice.findOne({ id_transaksi: transaksiSubsidi?._id });
        const invoiceTambahan = await Invoice.findOne({ id_transaksi: transaksi?._id, status: "Lunas" });
        let jumlah_uang = 0;
        const dataProduct = await DataProductOrder.findOne({ pesananId: req.params.id });

        const addedPengiriman = new Set();
        let totalPriceVendorSubsidi = 0;
        let totalPriceVendorTambahan = 0;
        let total_biaya_layanan = 0;
        let total_biaya_jasa_aplikasi = 0;
        for (const item of items) {
          const { product, ...restOfItem } = item;
          const { productId, quantity, ...restOfItemProduct } = product;
          const { userId, ...restOfProduct } = productId;
          const user = await User.findById(userId._id).select("email phone").lean();

          const productSummary = dataProduct.dataProduct.find((prod) => {
            return prod._id.toString() === productId._id.toString();
          });

          let detailToko;
          switch (userId.role) {
            case "vendor":
              detailToko = await TokoVendor.findOne({ userId: sellerId }).select("namaToko address").populate("address").lean();
              break;
            case "supplier":
              detailToko = await TokoSupplier.findOne({ userId: sellerId }).select("namaToko address").populate("address").lean();
              break;
            case "produsen":
              detailToko = await TokoProdusen.findOne({ userId: sellerId }).select("namaToko address").populate("address").lean();
              break;
          }

          const pengiriman = await Pengiriman.find({
            orderId: req.params.id,
          })
            .populate("distributorId")
            .populate("jenis_pengiriman")
            .populate("id_jenis_kendaraan")
            .lean();

          pengiriman
            .filter((pgr) => {
              return pgr.productToDelivers.some((prd) => prd.productId.toString() === productSummary?._id.toString()) && pgr.invoice.toString() === invoiceTambahan?._id.toString();
            })
            .forEach((pgr) => {
              pgr.productToDelivers.forEach((prd) => {
                if (prd.productId.toString() === productSummary._id.toString()) {
                  totalPriceVendorTambahan += prd.quantity * productSummary.total_price;
                }
              });
            });

          pengiriman
            .filter((pgr) => {
              return pgr.productToDelivers.some((prd) => prd.productId.toString() === productSummary?._id.toString()) && pgr.invoice.toString() === invoiceSubsidi?._id.toString();
            })
            .forEach((pgr) => {
              pgr.productToDelivers.forEach((prd) => {
                if (prd.productId.toString() === productSummary._id.toString()) {
                  totalPriceVendorSubsidi += prd.quantity * productSummary.total_price;
                }
              });
            });

          const selectedPengirimanSubsidi = pengiriman.find((pgr) => {
            return pgr.productToDelivers.some((prd) => prd.productId.toString() === productId._id.toString()) && pgr.invoice.toString() === invoiceSubsidi?._id.toString() && pgr.id_toko.toString() === detailToko._id.toString();
          });

          const selectedPengirimanTambahan = pengiriman.find((pgr) => {
            return pgr.productToDelivers.some((prd) => prd.productId.toString() === productId._id.toString()) && pgr.invoice.toString() === invoiceTambahan?._id.toString() && pgr.id_toko.toString() === detailToko._id.toString();
          });

          let quantityProduct = 0;
          const productSelected = dataProduct.dataProduct.find((prod) => {
            return prod._id.toString() === productId._id.toString() && prod.userId._id.toString() === sellerId.toString();
          });

          if (selectedPengirimanSubsidi) {
            const foundProd = selectedPengirimanSubsidi.productToDelivers.find((prd) => productSelected._id.toString() === prd.productId.toString());
            if (!addedPengiriman.has(selectedPengirimanSubsidi._id.toString())) {
              detailInvoiceSubsidi.totalOngkir += selectedPengirimanSubsidi.ongkir;
              detailInvoiceSubsidi.totalPotonganOngkir += selectedPengirimanSubsidi.potongan_ongkir;
              detailBiaya.total_potongan_ongkir += selectedPengirimanSubsidi.potongan_ongkir;
              detailBiaya.total_ongkir += selectedPengirimanSubsidi.total_ongkir;
              jumlah_uang += selectedPengirimanSubsidi.total_ongkir;
            }
            if (biaya_asuransi) {
              detailInvoiceSubsidi.asuransiPengiriman += dataOrder[0].biaya_awal_asuransi * foundProd.quantity;
            }
            detailInvoiceSubsidi.totalHargaProduk += productSelected.total_price * foundProd.quantity;
            detailInvoiceSubsidi.product.push({ name_product: productSelected.name_product, harga: productSelected.total_price, quantity: foundProd.quantity });
            jumlah_uang += productSelected.total_price * foundProd.quantity;
            const total_produk = productSelected.total_price * foundProd.quantity;
            detailBiaya.total_harga_produk += total_produk;
            quantityProduct += foundProd.quantity;
            addedPengiriman.add(selectedPengirimanSubsidi._id.toString());
          }

          if (selectedPengirimanTambahan) {
            const foundProd = selectedPengirimanTambahan.productToDelivers.find((prd) => productSelected._id.toString() === prd.productId.toString());
            if (!addedPengiriman.has(selectedPengirimanTambahan._id.toString())) {
              detailInvoiceTambahan.totalOngkir += selectedPengirimanTambahan.ongkir;
              detailInvoiceTambahan.totalPotonganOngkir += selectedPengirimanTambahan.potongan_ongkir;
              detailBiaya.total_potongan_ongkir += selectedPengirimanTambahan.potongan_ongkir;
              detailBiaya.total_ongkir += selectedPengirimanTambahan.total_ongkir;
              jumlah_uang += selectedPengirimanTambahan.total_ongkir;
            }
            if (biaya_asuransi) {
              detailInvoiceTambahan.asuransiPengiriman += dataOrder[0].biaya_awal_asuransi * foundProd.quantity;
            }
            detailInvoiceTambahan.totalHargaProduk += productSelected.total_price * foundProd.quantity;
            detailInvoiceTambahan.product.push({ name_product: productSelected.name_product, harga: productSelected.total_price, quantity: foundProd.quantity });
            jumlah_uang += productSelected.total_price * foundProd.quantity;
            const total_produk = productSelected.total_price * foundProd.quantity;
            detailBiaya.total_harga_produk += total_produk;
            quantityProduct += foundProd.quantity;
            addedPengiriman.add(selectedPengirimanTambahan._id.toString());
          }

          if (biaya_asuransi) {
            jumlah_uang += dataOrder[0].biaya_awal_asuransi * quantityProduct;
            detailBiaya.total_asuransi += dataOrder[0].biaya_awal_asuransi * quantityProduct;
          }

          if (productSelected) {
            if (!store[userId._id]) {
              store[userId._id] = {
                toko: {
                  userIdSeller: user._id,
                  email: user.email.content,
                  phone: user.phone.content,
                  ...detailToko,
                  ...restOfItem,
                  status_pengiriman: pengiriman.filter((pgr) => pgr.id_toko.toString() === detailToko._id.toString()),
                },
                bukti_pengiriman: null,
                products: [],
              };
            }
            store[userId._id].products.push({ ...productSelected, ...restOfItemProduct, quantity: quantityProduct });
          }
        }

        for(const key of Object.keys(store)){
          const total_produk_tambahan = detailInvoiceTambahan.totalHargaProduk;
          const total_produk_subsidi = detailInvoiceSubsidi.totalHargaProduk;
          const rasioJasaAplikasiSubsidi = totalPriceVendorSubsidi > 0 ? Math.round((total_produk_subsidi / totalPriceVendorSubsidi) * biaya_jasa_aplikasi) : 0;
          const rasioBiayaLayananSubsidi = totalPriceVendorSubsidi > 0 ? Math.round((total_produk_subsidi / totalPriceVendorSubsidi) * biaya_layanan) : 0;
          const rasioJasaAplikasiTambahan = totalPriceVendorTambahan > 0 ? Math.round((total_produk_tambahan / totalPriceVendorTambahan) * biaya_jasa_aplikasi) : 0;
          const rasioBiayaLayananTambahan = totalPriceVendorTambahan > 0 ? Math.round((total_produk_tambahan / totalPriceVendorTambahan) * biaya_layanan) : 0;
          detailInvoiceTambahan.biaya_jasa_aplikasi += rasioJasaAplikasiTambahan;
          detailInvoiceTambahan.biaya_layanan += rasioBiayaLayananTambahan;
          detailInvoiceSubsidi.biaya_jasa_aplikasi += rasioJasaAplikasiSubsidi;
          detailInvoiceSubsidi.biaya_layanan += rasioBiayaLayananSubsidi;
          total_biaya_jasa_aplikasi += rasioJasaAplikasiTambahan;
          total_biaya_layanan += rasioBiayaLayananTambahan;
          total_biaya_jasa_aplikasi += rasioJasaAplikasiSubsidi;
          total_biaya_layanan += rasioBiayaLayananSubsidi;
          if(store[key].toko.status_pengiriman[0].status_pengiriman === 'pesanan selesai'){
            const proses = await ProsesPengirimanDistributor.exists({pengirimanId: { $in: store[key].toko.status_pengiriman.map(pgr => pgr._id)}});
            const prosesPelacakan = await PelacakanDistributorKonsumen.findOne({id_pesanan: proses._id});
            store[key].bukti_pengiriman = {
              image: prosesPelacakan.image_pengiriman,
              latitude: prosesPelacakan.latitude,
              longitude: prosesPelacakan.longitude,
              waktu: prosesPelacakan.update_date_pesanan_selesai
            }
          }
          const incomplete = await IncompleteOrders.findOne({ pengirimanId: store[key].toko.status_pengiriman[0]._id });

          store[key].incomplete = incomplete ? 
          {
            status: true,
            message: `${store[key].products[0].name_product} yang bisa dipenuhi hanya ${incomplete.persentase}%. Mohon penuhi kekurangannya.`,
          } : 
          {
            status: false,
            message: ``
          }
          data.push(store[key]);
        }

        jumlah_uang += total_biaya_layanan + total_biaya_jasa_aplikasi;
        const pembatalan = await Pembatalan.findOne({ pesananId: _id, userId: req.user.id });
        const checkStatus = () => {
          if (pembatalan) {
            return "Dibatalkan";
          } else if (transaksiOrder.length > 1 && status === "Belum Bayar") {
            return "Berlangsung";
          } else {
            return status;
          }
        };

        const respon = {
          message: "get detail data order success",
          _id,
          alamatUser: addressId,
          order_detail,
          total_pesanan: jumlah_uang,
          status: checkStatus(),
          dibatalkanOleh: pembatalan ? pembatalan.canceledBy : null,
          invoice: invoiceSubsidi ? invoiceSubsidi : null,
          invoiceTambahan: invoiceTambahan ? invoiceTambahan : null,
          detailInvoiceSubsidi,
          detailInvoiceTambahan,
          biaya_layanan: Math.round(total_biaya_layanan),
          biaya_jasa_aplikasi: Math.round(total_biaya_jasa_aplikasi),
          ...restOfOrder,
          kode_transaksi: transaksi?.kode_transaksi || transaksiSubsidi?.kode_transaksi,
          ...detailBiaya,
          data,
        };

        return res.status(200).json(respon);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      next(error);
    }
  },

  checkStatusPembayaran: async (req, res, next) => {
    try {
      const { order_id } = req.query;
      const pesanan = await Pesanan.exists({ _id: order_id });
      const detailPesanan = await DetailPesanan.findOne({ id_pesanan: pesanan._id }).select("id_va").populate("id_va").lean();
      if (!detailPesanan) return res.status(404).json({ message: "pembayaran tidak ditemukan" });
      const panduan = await PanduanPembayaran.findOne({ bank_id: detailPesanan.id_va._id }).select("content");
      if (!detailPesanan) return res.status(404).json({ message: "order_id tidak ditemukan" });
      const resAxios = await axios.get(`https://api.sandbox.midtrans.com/v2/${detailPesanan._id}/status`, {
        headers: {
          Authorization: `Basic ${btoa(process.env.SERVERKEY + ":")}`,
        },
      });
      return res.status(200).json({
        message: "berhasil mendapatkan status pembayaran",
        paid: resAxios.data.transaction_status === "settlement" ? true : false,
        methodPembayaran: {
          ...detailPesanan,
          paymenNumbers: resAxios.data.va_numbers[0].va_number,
        },
        panduan,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  createOrder: async (req, res, next) => {
    try {
      const today = new Date();
      today.setDate(today.getDate() + 1);
      // today.setHours(today.getHours() + 1)
      today.setMinutes(today.getMinutes() + 4);

      const tommorow = new Date();
      tommorow.setDate(tommorow.getDate() + 1);

      const sixHoursAgo = formatWaktu(new Date(new Date().getTime() + 6 * 60 * 60 * 1000));
      const { metode_pembayaran, total, recurring, items, shipments, dp, biaya_asuransi, biaya_jasa_aplikasi, biaya_layanan, poin_terpakai, sekolahId, biaya_awal_asuransi } = req.body;

      if (Object.keys(req.body).length === 0) return res.status(400).json({ message: "Request Body tidak boleh kosong!" });
      if (!sekolahId && req.user.role === "konsumen") return res.status(400).json({ message: "Kirimkan Id Sekolah" });
      if (!req.body["items"]) return res.status(404).json({ message: "Tidak ada data items yang dikirimkan, tolong kirimkan data items yang akan dipesan" });
      if (!Array.isArray(req.body["items"])) return res.status(400).json({ message: "Body items bukan array, kirimkan array" });

      let total_pesanan = await Orders.countDocuments({
        createdAt: {
          $gte: now,
          $lt: tomorrow,
        },
      });

      const user = await User.findById(req.user.id);

      items.forEach((item, index) => {
        item.kode_pesanan = `PSN_${user.get("kode_role")}_${date}_${minutes}_${total_pesanan + index + 1}`;
        total_pesanan += 1;
      });

      const productIds = items.flatMap((item) =>
        item.product.map((prod) => ({
          productId: prod.productId,
          quantity: prod.quantity,
        }))
      );

      const a_day_later = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const products = await Product.find({ _id: { $in: productIds.map((prd) => prd.productId) } }).select("_id name_product total_stok minimalOrder image_product");

      for (const prod of productIds) {
        const found = products.find((item) => item._id === prod.productId.toString());
        if (!found) return res.status(404).json({ message: `Produk dengan id ${prod.productId} tidak ditemukan` });
        if (found.total_stok < prod.quantity) return res.status(400).json({ message: `Produk ${found.name_product} dipesan melebihi stok tersedia` });
        if (found.minimalOrder > prod.quantity) return res.status(400).json({ message: `Produk ${found.name_product} tidak bisa dipesan kurang dari minimal pemesanan` });
      }

      if (items.length !== shipments.length) return res.status(400).json({ message: "ama dengan dengan data pengiriman" });

      let toko_vendor = [];

      const decimalPattern = /^\d+\.\d+$/;
      if (decimalPattern.test(total)) return res.status(400).json({ message: `Total yang dikirimkan tidak boleh decimal. ${total}` });
      const idPesanan = new mongoose.Types.ObjectId();

      const dataOrder = await Orders.create({
        ...req.body,
        userId: req.user.id,
        date_order: date,
        biaya_asuransi: biaya_asuransi ? true : false,
      });

      let total_pengiriman = await Pengiriman.countDocuments({
        createdAt: {
          $gte: now,
          $lt: tomorrow,
        },
      });

      const promisesFunct = [];

      let total_transaksi = await Transaksi.countDocuments({
        createdAt: {
          $gte: now,
          $lt: tomorrow,
        },
      });

      let totalQuantity = 0;
      const ids = [];
      items.map((item) => {
        item.product.map((prod) => ids.push(prod.productId));
        item.product.map((prod) => {
          totalQuantity += prod.quantity;
        });
      });
      const arrayProducts = await Product.find({ _id: { $in: ids } })
        .populate({ path: "userId", select: "_id role" })
        .populate("categoryId")
        .lean();
      let transaksiMidtrans;
      let total_tagihan = biaya_jasa_aplikasi + biaya_layanan;
      const detailBiaya = {
        totalHargaProduk: 0,
        totalOngkir: 0,
        totalPotonganOngkir: 0,
        jumlahOngkir: 0,
        asuransiPengiriman: 0,
        biaya_jasa_aplikasi,
        biaya_layanan,
      };

      const detailBiayaSubsidi = {
        totalHargaProduk: 0,
        totalOngkir: 0,
        totalPotonganOngkir: 0,
        jumlahOngkir: 0,
        asuransiPengiriman: 0,
        biaya_jasa_aplikasi,
        biaya_layanan,
      };

      const detailBiayaTambahan = {
        totalHargaProduk: 0,
        totalOngkir: 0,
        totalPotonganOngkir: 0,
        jumlahOngkir: 0,
        asuransiPengiriman: 0,
        biaya_jasa_aplikasi,
        biaya_layanan,
      };
      let idPay;
      let nama;
      let va_user;
      let VirtualAccount;

      if (req.user.role === "konsumen") {
        const sekolah = await Sekolah.findOne({ _id: sekolahId, userId: req.user.id });
        if (!sekolah) return res.status(404).json({ message: "Tidak ada sekolah yang ditemukan" });

        if (sekolah.jumlahMurid === totalQuantity || sekolah.jumlahMurid > totalQuantity) {
          const idInvoiceSubsidi = new mongoose.Types.ObjectId();

          items.map((item) => {
            item.product.map((prd) => {
              const foundedProd = arrayProducts.find((prod) => prod._id.toString() === prd.productId.toString());
              detailBiaya.totalHargaProduk += foundedProd.total_price * prd.quantity;
              if (biaya_asuransi) {
                total_tagihan += prd.quantity * biaya_awal_asuransi;
                detailBiaya.asuransiPengiriman += prd.quantity * biaya_awal_asuransi;
              }

              promisesFunct.push(
                Product.findOneAndUpdate(
                  { _id: prd.productId },
                  {
                    $inc: {
                      total_stok: -prd.quantity,
                    },
                  }
                ),
                salesReport(prd.productId, {
                  time: new Date(),
                  soldAtMoment: prd.quantity,
                })
              );
            });
          });

          for (let i = 0; i < dataOrder.shipments.length; i++) {
            detailBiaya.totalOngkir += dataOrder.shipments[i].ongkir;
            detailBiaya.totalPotonganOngkir += dataOrder.shipments[i].potongan_ongkir;
            detailBiaya.jumlahOngkir += dataOrder.shipments[i].total_ongkir;
            const jenisJasa = await JenisJasaDistributor.exists({ _id: dataOrder.shipments[i].id_jenis_layanan });
            if (!jenisJasa) return res.status(404).json({ message: "Tidak ada jenis pengiriman dengan id " + dataOrder.shipments[i].id_jenis_layanan });
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
                tokoType: "TokoVendor",
                kode_pengiriman: `PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
                invoice: idInvoiceSubsidi,
              })
            );
            total_pengiriman += 1;
            const addedToko = new Set();
            for (const item of dataOrder.shipments[i].products) {
              const idToko = dataOrder.shipments[i].id_toko_vendor;
              const find_product = await Product.findOne({ _id: item.productId });
              const total_harga_product = find_product.price * item.quantity;
              const vendor = await TokoVendor.findById(dataOrder.shipments[i].id_toko_vendor).select("userId");
              if (!vendor) return res.status(404).json({ message: "id_toko_vendor di shipments tidak ditemukan, tolong cek lagi" });
              if (!addedToko.has(idToko.toString())) {
                toko_vendor.push({
                  id_toko_vendor: dataOrder.shipments[i].id_toko_vendor,
                  userId: vendor.userId,
                  total_harga: total_harga_product,
                  image_product: find_product.image_product[0],
                });
                addedToko.add(idToko.toString());
              }
            }
          }

          const kode_transaksi = await Transaksi.create({
            id_pesanan: dataOrder._id,
            jenis_transaksi: "keluar",
            status: "Menunggu Pembayaran",
            subsidi: true,
            detailBiaya,
            kode_transaksi: `TRX_${user.get("kode_role")}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`,
          });

          const invoice = await Invoice.create({
            _id: idInvoiceSubsidi,
            id_transaksi: kode_transaksi,
            userId: req.user.id,
            status: "Piutang",
            kode_invoice: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`,
          });

          promisesFunct.push(
            DataProductOrder.create({
              pesananId: dataOrder._id,
              dataProduct: arrayProducts,
            }),
            Orders.findByIdAndUpdate(dataOrder._id, { status: "Berlangsung" })
          );

          const formatHarga = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

          const notifikasiKonsumenId = new mongoose.Types.ObjectId();

          Notifikasi.create({
            _id: notifikasiKonsumenId,
            userId: user._id,
            invoiceId: idInvoiceSubsidi,
            jenis_invoice: "Subsidi",
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil simpan notif konsumen"))
            .catch(() => console.log("Gagal simpan notif konsumen"));

          DetailNotifikasi.create({
            notifikasiId: notifikasiKonsumenId,
            jenis: "Info",
            status: "Pesanan Makanan Bergizi Gratis telah berhasil",
            message: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1} Senilai Rp. ${formatHarga} telah berhasil, pesanan akan segera diproses`,
            image_product: products[0].image_product[0],
            kode: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`,
            redirect: 'detail-transaksi',
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil simpan detail notif konsumen"))
            .catch(() => console.log("Gagal simpan detail notif konsumen"));

          socket.emit("notif_pesanan_berhasil", {
            orderId: dataOrder._id,
            jenis: "Info",
            userId: user._id,
            status: "Pesanan Makanan Bergizi Gratis telah berhasil",
            message: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1} Senilai Rp. ${formatHarga} telah berhasil, pesanan akan segera diproses`,
            image: products[0].image_product[0],
            tanggal: `${formatTanggal(new Date())}`,
          });

          for (let i = 0; i < toko_vendor.length; i++) {
            const distributor = await Distributtor.findById(shipments[i].id_distributor);
            const id_notif_distri = new mongoose.Types.ObjectId();
            const formatHarga = toko_vendor[i].total_harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            const notifikasi_vendor_id = new mongoose.Types.ObjectId();

            Notifikasi.create({
              _id: id_notif_distri,
              userId: distributor.userId,
              invoiceId: idInvoiceSubsidi,
              jenis_invoice: "Subsidi",
              createdAt: new Date(),
            })
              .then(() => console.log("Berhasil simpan notif distributtor"))
              .catch(() => console.log("Gagal simpan notif distributtor"));

            DetailNotifikasi.create({
              notifikasiId: id_notif_distri,
              jenis: "Pengiriman",
              status: "Ada pesanan terbaru yang harus dikirim",
              message: `Terima pengiriman pesanan PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1} sebelum ${formatTanggalBulan(tommorow)} pukul ${formatWaktu(tommorow)}`,
              image_product: products[0].image_product[0],
              kode:`PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
              redirect: 'detail-pengiriman',
              createdAt: new Date(),
            })
              .then(() => console.log("Berhasil simpan detail notif distributtor"))
              .catch(() => console.log("Gagal simpan detail notif distributtor"));

            socket.emit("notif_distri_pengiriman_baru", {
              jenis: "Pesanan",
              userId: distributor.userId,
              status: "Ada pesanan terbaru yang harus dikirim",
              message: `Terima pengiriman pesanan PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1} sebelum ${formatTanggalBulan(tommorow)} pukul ${formatWaktu(tommorow)}`,
              image_product: products[0].image_product[0],
              tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
            });
            Notifikasi.create({
              _id: notifikasi_vendor_id,
              userId: toko_vendor[i].userId,
              invoiceId: idInvoiceSubsidi,
              jenis_invoice: "Subsidi",
              createdAt: new Date(),
            })
              .then(() => console.log("Berhasil simpan notif vendor"))
              .catch(() => console.log("Gagal simpan notif vendor"));

            DetailNotifikasi.create({
              notifikasiId: notifikasi_vendor_id,
              jenis: "Pesanan",
              status: `Ada ${totalQuantity} Pesanan Senilai Rp. ${formatHarga}`,
              message: `Segera terima pesanan INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1} sebelum jam ${sixHoursAgo}`,
              image_product: toko_vendor[i].image_product,
              kode: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`,
              redirect: 'detail-order',
              createdAt: new Date(),
            })
              .then(() => console.log("Berhasil simpan detail notif vendor"))
              .catch(() => console.log("Gagal simpan detail notif vendor"));

            socket.emit("notif_vendor_pesanan_masuk", {
              jenis: "Pesanan",
              userId: toko_vendor[i].userId,
              status: `Ada ${totalQuantity} Pesanan Senilai Rp. ${formatHarga}`,
              message: `Segera terima pesanan INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1} sebelum jam ${sixHoursAgo}`,
              image: toko_vendor[i].image_product,
              tanggal: `${formatTanggal(new Date())}`,
            });
          }
        } else if (totalQuantity > sekolah.jumlahMurid) {
          const splitted = metode_pembayaran.split(" / ");
          if (splitted[1].replace(/\u00A0/g, " ") == "Virtual Account") {
            va_user = await VaUser.findOne({
              nama_bank: splitted[0],
              userId: req.user.id,
            }).populate("nama_bank");
            VirtualAccount = await VA.findById(splitted[0]);
            if (!va_user) return res.status(404).json({ message: "User belum memiliki virtual account " + VirtualAccount.nama_bank });
            (idPay = va_user.nama_bank._id), (nama = va_user.nama_virtual_account);
          } else {
            paymentNumber = "123";
          }

          const va_used = await VA_Used.findOne({
            nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
            userId: req.user.id,
          });

          if (va_used) return res.status(403).json({ message: "Sedang ada transaki dengan virtual account ini", data: va_used });
          const id_notif_non_subsidi = new mongoose.Types.ObjectId();
          const id_notif_subsidi = new mongoose.Types.ObjectId();
          const id_transaksi_subsidi = new mongoose.Types.ObjectId();
          const id_invoice_subsidi = new mongoose.Types.ObjectId();
          const id_transaksi_non_subsidi = new mongoose.Types.ObjectId();
          const id_invoice_non_subsidi = new mongoose.Types.ObjectId();
          let sisaSubsidi = sekolah.jumlahMurid;
          let productNotif;
          const kodeInvoice = `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`;
          const ids = [];
          for (const item of items) {
            const dapatSubsidi = [];
            const tidakDapatSubsidi = [];

            for (const prod of item.product) {
              if (prod.quantity <= sisaSubsidi) {
                dapatSubsidi.push({
                  productId: prod.productId,
                  quantity: prod.quantity,
                });
                sisaSubsidi -= prod.quantity;
              } else {
                if (sisaSubsidi > 0) {
                  dapatSubsidi.push({
                    productId: prod.productId,
                    quantity: sisaSubsidi,
                  });
                  tidakDapatSubsidi.push({
                    productId: prod.productId,
                    quantity: prod.quantity - sisaSubsidi,
                  });
                  sisaSubsidi = 0;
                } else {
                  tidakDapatSubsidi.push({
                    productId: prod.productId,
                    quantity: prod.quantity,
                  });
                }
              }
            }

            let pengirimanSubsidi;
            let pengirimanNonSubsidi;
            let total_subsidi = 0;

            dapatSubsidi.map((ds) => {
              shipments.find((ship) => {
                ship.products.map((prod) => {
                  if (prod.productId === ds.productId) pengirimanSubsidi = ship;
                });
              });
            });

            tidakDapatSubsidi.map((tds) => {
              shipments.find((ship) => {
                ship.products.map((prod) => {
                  if (prod.productId === tds.productId) pengirimanNonSubsidi = ship;
                });
              });
            });
            // return res.status(200).json(dapatSubsidi)
            if (dapatSubsidi.length > 0) {
              const totalProduk = pengirimanSubsidi.products.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.quantity;
              }, 0);

              const totalProdukSubsidi = dapatSubsidi.reduce((acc, val) => {
                ids.push(val.productId);
                return acc + val.quantity;
              }, 0);

              const baseOngkir = pengirimanSubsidi.ongkir / totalProduk;
              const basePotonganOngkir = pengirimanSubsidi.potongan_ongkir / totalProduk;
              const potongan_ongkir = Math.round(basePotonganOngkir * totalProdukSubsidi);
              const ongkir = Math.round(baseOngkir * totalProdukSubsidi);
              const total_ongkir = ongkir - potongan_ongkir;
              detailBiayaSubsidi.totalOngkir += ongkir;
              detailBiayaSubsidi.totalPotonganOngkir += potongan_ongkir;
              detailBiayaSubsidi.jumlahOngkir += total_ongkir;
              total_subsidi += total_ongkir;
              let productIds = [];

              for (const prd of dapatSubsidi) {
                const prod = await Product.findById(prd.productId).select("total_price image_product userId").lean();
                productIds.push(prd.productId);
                total_subsidi += prod.total_price * prd.quantity;
                detailBiayaSubsidi.totalHargaProduk += prod.total_price * prd.quantity;
                promisesFunct.push(
                  Product.findByIdAndUpdate(prd.productId, {
                    $inc: {
                      total_stok: -prd.quantity,
                    },
                  }),
                  salesReport(prd.productId, {
                    time: new Date(),
                    soldAtMoment: prd.quantity,
                  })
                );
                const hargaVendor = prod.total_price * prd.quantity;
                const formatHargaVendor = hargaVendor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

                const notifikasi_vendor_id = new mongoose.Types.ObjectId();
                Notifikasi.create({
                  _id: notifikasi_vendor_id,
                  userId: prod.userId,
                  invoiceId: id_invoice_subsidi,
                  jenis_invoice: "Subsidi",
                  createdAt: new Date(),
                })
                  .then(() => console.log("Berhasil simpan notif vendor"))
                  .catch(() => console.log("Gagal simpan notif vendor"));

                DetailNotifikasi.create({
                  notifikasiId: notifikasi_vendor_id,
                  jenis: "Pesanan",
                  status: `Ada ${prd.quantity} Pesanan Senilai Rp. ${formatHargaVendor}`,
                  message: `Segera terima pesanan INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1} sebelum ${sixHoursAgo}`,
                  image_product: prod.image_product[0],
                  kode: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`,
                  redirect: 'detail-order',
                  createdAt: new Date(),
                })
                  .then(() => console.log("Berhasil simpan detail notif vendor"))
                  .catch(() => console.log("Gagal simpan detail notif vendor"));

                socket.emit("notif_vendor_pesanan_masuk", {
                  jenis: "Pesanan",
                  userId: prod.userId,
                  status: `Ada ${prd.quantity} Pesanan Senilai Rp. ${formatHargaVendor}`,
                  message: `Segera terima pesanan INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1} sebelum ${sixHoursAgo}`,
                  image: prod.image_product[0],
                  tanggal: `${formatTanggal(new Date())}`,
                });
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
                  tokoType: "TokoVendor",
                  kode_pengiriman: `PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
                  invoice: id_invoice_subsidi,
                })
              );

              const products = await Product.find({ _id: { $in: productIds } }).select("_id total_price name_product image_product");

              const formatHarga = total_subsidi.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

              Notifikasi.create({
                _id: id_notif_subsidi,
                userId: user._id,
                invoiceId: id_invoice_subsidi,
                jenis_invoice: "Subsidi",
                createdAt: new Date(),
              })
                .then(() => console.log("Berhasil simpan notif subsidi konsumen"))
                .catch(() => console.log("Gagal simpan notif subsidi konsumen"));

              DetailNotifikasi.create({
                notifikasiId: id_notif_subsidi,
                jenis: "Info",
                status: "Pesanan Makanan Bergizi Gratis telah berhasil",
                message: `${kodeInvoice} Senilai Rp. ${formatHarga} telah berhasil, pesanan akan segera diproses`,
                image_product: products[0].image_product[0],
                kode: kodeInvoice,
                redirect: 'detial-transaksi',
                createdAt: new Date(),
              })
                .then(() => console.log("Berhasil simpan detail subsidi notif konsumen"))
                .catch(() => console.log("Gagal simpan detail subsidi notif konsumen"));

              socket.emit("notif_pesanan_berhasil", {
                orderId: dataOrder._id,
                jenis: "Info",
                userId: user._id,
                status: "Pesanan Makanan Bergizi Gratis telah berhasil",
                message: `${kodeInvoice} Senilai Rp. ${formatHarga} telah berhasil, pesanan akan segera diproses`,
                image: products[0].image_product[0],
                tanggal: formatTanggal(new Date()),
              });
            }

            if (tidakDapatSubsidi.length > 0) {
              productNotif = await Product.findById(tidakDapatSubsidi[0].productId).select("_id name_product image_product");
              const totalProdukSubsidi = tidakDapatSubsidi.reduce((acc, val) => acc + val.quantity, 0);
              const totalProduk = pengirimanNonSubsidi.products.reduce((acc, prod) => acc + prod.quantity, 0);
              const baseOngkir = pengirimanNonSubsidi.ongkir / totalProduk;
              const basePotonganOngkir = pengirimanNonSubsidi.potongan_ongkir / totalProduk;
              const potongan_ongkir = Math.round(basePotonganOngkir * totalProdukSubsidi);
              const ongkir = Math.round(baseOngkir * totalProdukSubsidi);
              const total_ongkir = ongkir - potongan_ongkir;
              detailBiayaTambahan.totalOngkir += ongkir;
              detailBiayaTambahan.totalPotonganOngkir += potongan_ongkir;
              detailBiayaTambahan.jumlahOngkir += total_ongkir;

              for (const prod of tidakDapatSubsidi) {
                const product = await Product.findById(prod.productId).select("total_price").lean();
                total_tagihan += product.total_price * prod.quantity;
                detailBiayaTambahan.totalHargaProduk += product.total_price * prod.quantity;
                if (biaya_asuransi) {
                  total_tagihan += prod.quantity * biaya_awal_asuransi;
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
                  tokoType: "TokoVendor",
                  kode_pengiriman: `PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
                  invoice: id_invoice_non_subsidi,
                })
              );

              total_tagihan += total_ongkir;
            }
            total_pengiriman += 1;
          }
          const arrayProducts = await Product.find({ _id: { $in: ids } })
            .populate({ path: "userId", select: "_id role" })
            .populate("categoryId")
            .lean();

          promisesFunct.push(
            Transaksi.create({
              _id: id_transaksi_subsidi,
              id_pesanan: dataOrder._id,
              jenis_transaksi: "keluar",
              status: "Menunggu Pembayaran",
              subsidi: true,
              detailBiaya: detailBiayaSubsidi,
              kode_transaksi: `TRX_${user.get("kode_role")}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`,
            }),

            Transaksi.create({
              _id: id_transaksi_non_subsidi,
              id_pesanan: dataOrder._id,
              jenis_transaksi: "keluar",
              status: "Menunggu Pembayaran",
              detailBiaya: detailBiayaTambahan,
              subsidi: false,
              kode_transaksi: `TRX_${user.get("kode_role")}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`,
            }),

            Invoice.create({
              _id: id_invoice_subsidi,
              id_transaksi: id_transaksi_subsidi,
              userId: req.user.id,
              status: "Piutang",
              kode_invoice: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`,
            }),

            Invoice.create({
              _id: id_invoice_non_subsidi,
              id_transaksi: id_transaksi_non_subsidi,
              userId: req.user.id,
              status: "Belum Lunas",
              kode_invoice: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`,
            }),

            DataProductOrder.create({
              pesananId: dataOrder._id,
              dataProduct: arrayProducts,
            })
          );
          const grossAmount = () => {
            if (dp.isUsed && poin_terpakai) {
              return dp.value * Math.round(total_tagihan) - poin_terpakai;
            } else if (dp.isUsed) {
              return dp.value * Math.round(total_tagihan);
            } else {
              return Math.round(total_tagihan);
            }
          };
          const options = {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              Authorization: `Basic ${btoa(process.env.SERVERKEY + ":")}`,
            },
            body: JSON.stringify({
              payment_type: "bank_transfer",
              transaction_details: {
                order_id: idPesanan,
                gross_amount: grossAmount(),
              },
              bank_transfer: {
                bank: VirtualAccount.nama_bank.toLowerCase(),
                va_number: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
              },
            }),
          };

          const respon = await fetch(`${process.env.MIDTRANS_URL}/charge`, options);
          transaksiMidtrans = await respon.json();

          promisesFunct.push(
            VA_Used.create({
              nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
              orderId: idPesanan,
              userId: req.user.id,
            })
          );
          const formatHarga = total_tagihan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

          Notifikasi.create({
            _id: id_notif_non_subsidi,
            userId: user._id,
            invoiceId: id_invoice_non_subsidi,
            jenis_invoice: "Non Subsidi",
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil simpan notif non subsidi konsumen"))
            .catch(() => console.log("Gagal simpan notif non subsidi konsumen"));

          DetailNotifikasi.create({
            notifikasiId: id_notif_non_subsidi,
            jenis: "Info",
            status: "Selesaikan pembayaranmu",
            message: `${kodeInvoice} Senilai Rp. ${formatHarga} belum dibayar, segera selesaikan pembayaranmu sebelum ${formatTanggal(a_day_later)}`,
            image_product: productNotif.image_product[0],
            kode: kodeInvoice,
            redirect: 'detail-transaksi',
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil simpan notif non subsidi konsumen"))
            .catch(() => console.log("Gagal simpan notif non subsidi konsumen"));

          socket.emit("notif_selesaikan_pembayaran", {
            orderId: dataOrder._id,
            jenis: "Info",
            userId: user._id,
            status: "Selesaikan pembayaranmu",
            message: `${kodeInvoice} Senilai Rp. ${formatHarga} belum dibayar, segera selesaikan pembayaranmu sebelum ${formatTanggal(a_day_later)}`,
            image: productNotif.image_product[0],
            tanggal: `${formatTanggal(new Date())}`,
          });
        }
      } else {
        if (req.body.sekolahId) return res.status(400).json({ message: "Gak usah ada sekolahId" });
        const id_transaksi_non_subsidi = new mongoose.Types.ObjectId();
        const id_invoice_non_subsidi = new mongoose.Types.ObjectId();
        const splitted = metode_pembayaran.split(" / ");
        if(splitted[0].trim().length === 0 || splitted[1].trim().length === 0) return res.status(400).json({ message: "Metode pembayaran tidak valid" });
        if (splitted[1].replace(/\u00A0/g, " ") == "Virtual Account") {
          va_user = await VaUser.findOne({
            nama_bank: splitted[0],
            userId: req.user.id,
          }).populate("nama_bank");
          VirtualAccount = await VA.findById(splitted[0]);
          if (!va_user) return res.status(404).json({ message: "User belum memiliki virtual account " + VirtualAccount.nama_bank });
          (idPay = va_user.nama_bank._id), (nama = va_user.nama_virtual_account);
        } else {
          paymentNumber = "123";
        }

        const va_used = await VA_Used.findOne({
          nomor_va: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
          userId: req.user.id,
        });

        if (va_used) return res.status(403).json({ message: "Sedang ada transaki dengan virtual account ini", data: va_used });
        const ids = [];
        for (const item of items) {
          productNotif = await Product.findById(item.product[0].productId).select("_id name_product image_product");
          const totalProdukSubsidi = item.product.reduce((acc, val) => acc + val.quantity, 0);
          const products = [];
          for (const prod of item.product) {
            const product = await Product.findById(prod.productId).select("total_price").lean();
            total_tagihan += product.total_price * prod.quantity;
            detailBiayaTambahan.totalHargaProduk += product.total_price * prod.quantity;
            if (biaya_asuransi) {
              total_tagihan += prod.quantity * biaya_awal_asuransi;
            }
            products.push({
              productId: prod.productId,
              quantity: prod.quantity,
            });
          }
          const pengiriman = shipments.find((shp) => {
            const shipProducts = shp.products.map((prod) => prod.productId);
            return products.some((prd) => shipProducts.includes(prd.productId));
          });
          const totalProduk = pengiriman.products.reduce((acc, prod) => acc + prod.quantity, 0);
          const baseOngkir = pengiriman.ongkir / totalProduk;
          const basePotonganOngkir = pengiriman.potongan_ongkir / totalProduk;
          const potongan_ongkir = Math.round(basePotonganOngkir * totalProdukSubsidi);
          const ongkir = Math.round(baseOngkir * totalProdukSubsidi);
          const total_ongkir = ongkir - potongan_ongkir;
          detailBiayaTambahan.totalOngkir += ongkir;
          detailBiayaTambahan.totalPotonganOngkir += potongan_ongkir;
          detailBiayaTambahan.jumlahOngkir += total_ongkir;

          let tokoType;
          switch (req.user.role) {
            case "vendor":
              tokoType = "TokoSupplier";
              break;
            case "supplier":
              tokoType = "TokoProdusen";
          }

          promisesFunct.push(
            Pengiriman.create({
              orderId: dataOrder._id,
              distributorId: pengiriman.id_distributor,
              productToDelivers: products,
              waktu_pengiriman: item.deadline,
              total_ongkir,
              ongkir,
              potongan_ongkir,
              jenis_pengiriman: pengiriman.id_jenis_layanan,
              id_jenis_kendaraan: pengiriman.id_jenis_kendaraan,
              id_toko: pengiriman.id_toko_vendor,
              tokoType,
              kode_pengiriman: `PNR_${user.kode_role}_${date}_${minutes}_${total_pengiriman + 1}`,
              invoice: id_invoice_non_subsidi,
            })
          );

          total_tagihan += total_ongkir;

          total_pengiriman += 1;
        }
        const arrayProducts = await Product.find({ _id: { $in: ids } })
          .populate({ path: "userId", select: "_id role" })
          .populate("categoryId")
          .lean();

        promisesFunct.push(
          Transaksi.create({
            _id: id_transaksi_non_subsidi,
            id_pesanan: dataOrder._id,
            jenis_transaksi: "keluar",
            status: "Menunggu Pembayaran",
            detailBiaya: detailBiayaTambahan,
            subsidi: false,
            kode_transaksi: `TRX_${user.get("kode_role")}_OUT_SYS_${date}_${minutes}_${total_transaksi + 1}`,
          }),

          Invoice.create({
            _id: id_invoice_non_subsidi,
            id_transaksi: id_transaksi_non_subsidi,
            userId: req.user.id,
            status: "Belum Lunas",
            kode_invoice: `INV_${user.get("kode_role")}_${date}_${minutes}_${total_transaksi + 1}`,
          }),

          DataProductOrder.create({
            pesananId: dataOrder._id,
            dataProduct: arrayProducts,
          })
        );

        const grossAmount = () => {
          if (dp.isUsed && poin_terpakai) {
            return dp.value * Math.round(total_tagihan) - poin_terpakai;
          } else if (dp.isUsed) {
            return dp.value * Math.round(total_tagihan);
          } else {
            return Math.round(total_tagihan);
          }
        };

        const options = {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: `Basic ${btoa(process.env.SERVERKEY + ":")}`,
          },
          body: JSON.stringify({
            payment_type: "bank_transfer",
            transaction_details: {
              order_id: idPesanan,
              gross_amount: grossAmount(),
            },
            bank_transfer: {
              bank: VirtualAccount.nama_bank.toLowerCase(),
              va_number: va_user.nomor_va.split(VirtualAccount.kode_perusahaan)[1],
            },
          }),
        };

        const respon = await fetch(`${process.env.MIDTRANS_URL}/charge`, options);
        transaksiMidtrans = await respon.json();
      }

      promisesFunct.push(
        DetailPesanan.create({
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
          biaya_asuransi,
        })
      );
      await Promise.all(promisesFunct);

      return res.status(201).json({
        message: `Berhasil membuat Pesanan`,
        datas: dataOrder,
        nama: nama ? nama : undefined,
        paymentNumber: transaksiMidtrans ? transaksiMidtrans.va_numbers[0].va_number : null,
        VirtualAccount,
        total_tagihan,
        transaksi: transaksiMidtrans
          ? {
              waktu: transaksiMidtrans.transaction_time,
              orderId: transaksiMidtrans.order_id,
            }
          : null,
      });
    } catch (error) {
      console.log(error);
      if (error && error.name == "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      next(error);
    }
  },

  update_status: async (req, res, next) => {
    try {
      if (!req.body.pesananId || !req.body.status) return res.status(401).json({ message: `Dibutuhkan payload dengan nama pesananId dan status` });
      if (req.body.status !== "Berhasil") return res.status(400).json({ message: "Status yang dikirimkan tidak valid" });
      const pesanan = await Orders.findById(req.body.pesananId).lean();
      if (!pesanan) return res.status(404).json({ message: `Tidak ada pesanan dengan id: ${req.body.pesananId}` });
      const productIds = [];
      const ships = [];
      pesanan.items.map((item) => productIds.push(item.product));
      pesanan.shipments.map((item) => ships.push(item));
      if (!pesanan) return res.status(404).json({ message: `pesanan dengan id: ${req.body.pesananID} tidak ditemukan` });
      if (pesanan.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa mengubah data orang lain!" });
      const total_transaksi = await Transaksi.countDocuments({
        createdAt: {
          $gte: now,
          $lt: tomorrow,
        },
      });
      const writeDb = [Orders.updateOne({ _id: pesanan._id }, { status: req.body.status })];

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
              kode_transaksi: `TRX_${user_distributor.kode_role}_IN_SYS_${date}_${minutes}_${total_transaksi + 1}`,
            }),
            Transaksi.create({
              id_pesanan: pesanan._id,
              jenis_transaksi: "keluar",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_SYS_OUT_${user_distributor.kode_role}_${date}_${minutes}_${total_transaksi + 1}`,
            })
          );
        }
      }

      writeDb.push(
        Transaksi2.create({
          jumlah: 20000,
          jenis_transaksi: "bagian perusahaan",
          status: "Pembayaran Berhasil",
          kode_transaksi: `TRX_SYS_OUT_PRH_${date}_${minutes}_${total_transaksi + 1}`,
        }),
        Transaksi2.create({
          jumlah: 20000,
          jenis_transaksi: "bagian perusahaan",
          status: "Pembayaran Berhasil",
          kode_transaksi: `TRX_PRH_IN_SYS_${date}_${minutes}_${total_transaksi + 1}`,
        })
      );

      const socket = io("https://probable-subtly-crawdad.ngrok-free.app", {
        auth: {
          fromServer: true,
        },
      });

      for (const item of productIds) {
        const product = await Product.findById(item);
        socket.emit("notif_pesanan_selesai", {
          jenis: "Pesanan",
          userId: pesanan.userId,
          status: "Pesanan telah selesai",
          message: `Pesanan ${product.name_product} telah selesai`,
          image: product.image_product[0],
          tanggal: `${new Date().toLocaleTimeString("en-GB")}`,
        });
      }

      await Promise.all(writeDb);
      return res.status(200).json({ message: "Berhasil Merubah Status" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  confirmOrder: async (req, res, next) => {
    try {
      if (req.user.role === "konsumen") return res.status(403).json({ message: "Invalid Request" });
      const biayaTetap = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" }).lean();
      const { userIdKonsumen, pengirimanId, completedOrders } = req.body;
      const pengiriman = await Pengiriman.findById(pengirimanId)
        .populate({
          path: "orderId",
          populate: "addressId",
        })
        .populate({
          path: "id_toko",
          populate: "address",
        })
        .populate("invoice")
        .populate("productToDelivers.productId")
        .lean();

      const total_produk_qty = pengiriman.productToDelivers.reduce((acc, val) => acc + val.quantity, 0);
      const avgPengemasan = biayaTetap.lama_pengemasan;
      const avgKecepatan = biayaTetap.rerata_kecepatan;
      const maxPengemasanPengiriman = biayaTetap.max_pengemasan_pengiriman * 60;
      const persentase = completedOrders / total_produk_qty * 100;
      if (!userIdKonsumen) return res.status(400).json({ message: "Kirimkan userId konsumen" });
      if (completedOrders < total_produk_qty && persentase > 50) {
        await IncompleteOrders.create({
          userIdSeller: req.user.id,
          userIdKonsumen,
          pengirimanId,
          completedOrders,
          persentase
        });
      }else if( completedOrders < total_produk_qty && persentase < 50){
        await IncompleteOrders.create({
          userIdSeller: req.user.id,
          userIdKonsumen,
          pengirimanId,
          completedOrders,
          persentase
        });
        await Vendor.updateOne({ userId: req.user.id }, { $inc: { nilai_pinalti: 1 } });
      }else if( completedOrders === 0 ){
        await IncompleteOrders.create({
          userIdSeller: req.user.id,
          userIdKonsumen,
          pengirimanId,
          completedOrders,
          persentase
        });
        await Vendor.updateOne({ userId: req.user.id }, { $inc: { nilai_pinalti: 2 } });
      }

      if (!pengiriman) return res.status(404).json({ message: `Tidak ada pengiriman dengan id ${pengirimanId}` });

      if(completedOrders === total_produk_qty){
        await Pengiriman.findByIdAndUpdate(pengirimanId, { sellerApproved: true, amountCapable: completedOrders });
      }

      const transaksi = await Transaksi.findById(pengiriman.invoice.id_transaksi);
      if (transaksi.subsidi == true) {
        const totalQuantity = pengiriman.productToDelivers.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.quantity;
        }, 0);

        const latTokoVendor = parseFloat(pengiriman.id_toko.address.pinAlamat.lat);
        const longTokoVendor = parseFloat(pengiriman.id_toko.address.pinAlamat.long);

        const latKonsumen = parseFloat(pengiriman.orderId.addressId.pinAlamat.lat);
        const longKonsumen = parseFloat(pengiriman.orderId.addressId.pinAlamat.long);

        const jarakTempuh = await calculateDistance(latTokoVendor, longTokoVendor, latKonsumen, longKonsumen, biayaTetap.radius);

        const waktuPengiriman = (jarakTempuh / avgKecepatan) * 3600;
        const waktuPengemasan = totalQuantity * avgPengemasan * 60;

        let totalPengemasanPengiriman = waktuPengemasan + waktuPengiriman;
        if (totalPengemasanPengiriman > maxPengemasanPengiriman) {
          totalPengemasanPengiriman = maxPengemasanPengiriman;
        }

        const pengemasan = await Pengemasan.create({
          pengirimanId: pengiriman._id,
          total_quantity: totalQuantity,
          total_jarak: jarakTempuh !== NaN ? jarakTempuh : 0,
          waktu_pengemasan: waktuPengemasan,
          waktu_pengiriman: waktuPengiriman,
          total_pengemasan_pengiriman: totalPengemasanPengiriman,
        });

        const notifikasi = await Notifikasi.findOne({ invoiceId: pengiriman.invoice._id }).lean();
        if (!notifikasi) return res.status(404).json({ message: `Tidak ada notifikasi dengan invoiceId ${pengiriman.invoice._id}` });

        DetailNotifikasi.create({
          notifikasiId: notifikasi._id,
          status: "Pesanan telah dikonfirmasi",
          message: `${pengiriman.invoice.kode_invoice} telah dikonfirmasi penjual dan akan segera dikemas`,
          jenis: "Pesanan",
          image_product: pengiriman.productToDelivers[0].productId.image_product[0],
          kode: pengiriman.invoice.kode_invoice,
          redirect: 'detail-transaksi',
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil simpan detail notif konsumen"))
          .catch(() => console.log("Gagal simpan detail notif konsumen"));

        socket.emit("notif_pesanan_dikonfirmasi", {
          jenis: "Pesanan",
          userId: notifikasi.userId,
          status: "Pesanan telah dikonfirmasi",
          message: `${pengiriman.invoice.kode_invoice} telah dikonfirmasi penjual dan akan segera dikemas`,
          image: pengiriman.productToDelivers[0].productId.image_product[0],
          tanggal: `${formatWaktu(new Date())}`,
        });

        return res.status(200).json({ message: "Berhasil Mengkonfirmasi Pesanan", pengemasan });
      } else {
        const pengemasan = await Pengemasan.findOne({
          orderId: pengiriman.orderId,
        });

        const totalQuantity = pengiriman.productToDelivers.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.quantity;
        }, 0);

        const totalQuantityUpdate = pengemasan?.total_quantity + totalQuantity;

        const waktuPengemasan = totalQuantity * avgPengemasan * 60;

        let totalPengemasanPengiriman = pengemasan?.total_pengemasan_pengiriman + waktuPengemasan;

        if (totalPengemasanPengiriman > maxPengemasanPengiriman) {
          totalPengemasanPengiriman = maxPengemasanPengiriman;
        }

        const updatePengemasan = await Pengemasan.findOneAndUpdate(
          {
            orderId: pengiriman.orderId,
          },
          {
            total_quantity: totalQuantityUpdate || 0,
            total_pengemasan_pengiriman: totalPengemasanPengiriman || 0,
          },
          {
            new: true,
          }
        );

        const notifikasi = await Notifikasi.findOne({ invoiceId: pengiriman.invoice._id }).lean();
        if (!notifikasi) return res.status(404).json({ message: `Tidak ada notifikasi dengan invoiceId ${pengiriman.invoice._id}` });

        DetailNotifikasi.create({
          notifikasiId: notifikasi._id,
          status: "Pesanan telah dikonfirmasi",
          message: `${pengiriman.invoice.kode_invoice} telah dikonfirmasi penjual dan akan segera dikemas`,
          jenis: "Pesanan",
          image_product: pengiriman.productToDelivers[0].productId.image_product[0],
          kode: pengiriman.invoice.kode_invoice,
          redirect: 'detail-transaksi',
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil simpan notif konsumen"))
          .catch(() => console.log("Gagal simpan notif konsumen"));

        socket.emit("notif_pesanan_dikonfirmasi", {
          jenis: "Pesanan",
          userId: notifikasi.userId,
          status: "Pesanan telah dikonfirmasi",
          message: `${pengiriman.invoice.kode_invoice} telah dikonfirmasi penjual dan akan segera dikemas`,
          image: pengiriman.productToDelivers[0].productId.image_product[0],
          tanggal: `${formatWaktu(new Date())}`,
        });
        return res.status(200).json({ message: "Berhasil Mengkonfirmasi Pesanan", updatePengemasan });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  orderSuccess: async (req, res, next) => {
    try {
      const { pengirimanIds } = req.body;
      const biayaTetap = await BiayaTetap.findOne({}).lean();
      const shipments = await Pengiriman.find({ _id: { $in: pengirimanIds } })
        .populate("productToDelivers.productId")
        .lean();
      const invoice = await Transaksi.aggregate([
        { $match: { id_pesanan: new mongoose.Types.ObjectId(shipments[0].orderId) } },
        { $project: { _id: 1 } },
        {
          $lookup: {
            from: "invoices",
            let: { id_transaksi: "$_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$id_transaksi", "$$id_transaksi"] } } }],
            as: "invoice",
          },
        },
        { $unwind: "$invoice" },
      ]);
      const promisesFunction = [];
      let total_transaksi = await Transaksi.countDocuments({
        createdAt: {
          $gte: now,
          $lt: tomorrow,
        },
      });
      const countedSeller = new Set();
      const countedDistri = new Set();
      const addedInv = new Set();
      const from = [];
      for (const shp of shipments) {
        const prosesPengiriman = await ProsesPengirimanDistributor.findOne({ pengirimanId: { $in: [shp._id] } })
          .populate({ path: "buyerId" })
          .lean();

        if (prosesPengiriman.buyerId.userId.toString() !== req.user.id.toString()) return res.status(403).json({ message: "Tidak bisa mengubah punya orang lain" });
        const dataProduct = await DataProductOrder.findOne({ pesananId: shp.orderId });
        const incompleteOrder = await IncompleteOrders.findOne({ pengirimanId: shp._id });
        const inv = await Invoice.findOne({ _id: shp.invoice, status: "Lunas" }).populate("id_transaksi");
        let user;
        let total_harga_produk = 0;
        for (prd of shp.productToDelivers) {
          const selectedProduct = dataProduct.dataProduct.find((prod) => prod._id === prd.productId._id);
          from.push(selectedProduct);
          if (inv) {
            total_harga_produk += selectedProduct.total_price * prd.quantity;

            if (!countedSeller.has(user?._id.toString())) {
              user = await User.findById(selectedProduct.userId);
              promisesFunction.push(
                PoinHistory.create({
                  userId: user._id,
                  jenis: "masuk",
                  value: biayaTetap.poinPembelian,
                  from,
                })
              );
              countedSeller.add(user._id.toString());
            }
          }
        }
        if (inv) {
          const distri = await Distributtor.findById(shp.distributorId).select("userId");
          const userDistri = await User.findById(distri.userId);

          if (!countedDistri.has(userDistri?._id.toString())) {
            promisesFunction.push(
              PoinHistory.create({
                userId: userDistri._id,
                jenis: "masuk",
                value: biayaTetap.poinPembelian,
                from,
              })
            );
            countedDistri.add(userDistri._id.toString());
          }

          if (!addedInv.has(inv._id.toString())) {
            promisesFunction.push(
              Transaksi2.create({
                id_pesanan: shp.orderId,
                jenis_transaksi: "masuk",
                status: "Pembayaran Berhasil",
                kode_transaksi: `TRX_SYS_OUT_PRH_${date}_${minutes}_${(total_transaksi += 1)}`,
                jumlah: inv.id_transaksi.detailBiaya.biaya_layanan + inv.id_transaksi.detailBiaya.biaya_jasa_aplikasi,
              }),

              Transaksi2.create({
                id_pesanan: shp.orderId,
                jenis_transaksi: "masuk",
                status: "Pembayaran Berhasil",
                kode_transaksi: `TRX_PRH_IN_SYS_${date}_${minutes}_${(total_transaksi += 1)}`,
                jumlah: inv.id_transaksi.detailBiaya.biaya_layanan + inv.id_transaksi.detailBiaya.biaya_jasa_aplikasi,
              })
            );

            addedInv.add(inv._id.toString());
          }

          promisesFunction.push(
            Transaksi.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "masuk",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_${user.get("kode_role")}_IN_SYS_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: user._id,
              jumlah: total_harga_produk,
            }),

            Transaksi2.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "keluar",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_SYS_OUT_${user.get("kode_role")}_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: user._id,
              jumlah: total_harga_produk,
            }),

            Transaksi.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "keluar",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_${user.get("kode_role")}_OUT_PRH_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: user._id,
              jumlah: biayaTetap.fee_vendor,
            }),

            Transaksi2.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "masuk",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_PRH_IN_${user.get("kode_role")}_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: user._id,
              jumlah: biayaTetap.fee_vendor,
            }),

            Transaksi.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "masuk",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_${userDistri.get("kode_role")}_IN_SYS_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: userDistri._id,
              jumlah: shp.total_ongkir,
            }),

            Transaksi.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "keluar",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_${userDistri.get("kode_role")}_OUT_PRH_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: userDistri._id,
              jumlah: biayaTetap.fee_distributor,
            }),

            Transaksi2.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "keluar",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_SYS_OUT_${userDistri.get("kode_role")}_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: userDistri._id,
              jumlah: shp.total_ongkir,
            }),

            Transaksi2.create({
              id_pesanan: shp.orderId,
              jenis_transaksi: "masuk",
              status: "Pembayaran Berhasil",
              kode_transaksi: `TRX_PRH_IN_${userDistri.get("kode_role")}_${date}_${minutes}_${(total_transaksi += 1)}`,
              userId: userDistri._id,
              jumlah: biayaTetap.fee_distributor,
            })
          );
        }
      }
      await Pengiriman.updateMany({ _id: { $in: pengirimanIds } }, { isBuyerAccepted: true });
      if (invoice.length == 1) {
        if (req.user.role !== "konsumen") {
          promisesFunction.push(
            PoinHistory.create({
              userId: req.user.id,
              jenis: "masuk",
              value: biayaTetap.poinPembelian,
              from,
            })
          );
        }
        const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id });
        DetailNotifikasi.create({
          notifikasiId: notifikasi._id,
          status: "Pesanan telah selesai",
          jenis: "Pesanan",
          message: `Klik untuk beri penilaian ${invoice[0].invoice.kode_invoice}`,
          image_product: shipments[0].productToDelivers[0].productId.image_product[0],
          kode: invoice[0].invoice.kode_invoice,
          redirect: 'detail-transaksi',
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan detail notifikasi"))
          .catch(() => console.log("Gagal menyimpan detail notifikasi"));

        socket.emit("notif_pesanan_selesai", {
          jenis: "Pesanan",
          userId: notifikasi.userId,
          status: "Pesanan telah selesai",
          message: `Klik untuk beri penilaian ${invoice[0].invoice.kode_invoice}`,
          image: shipments[0].productToDelivers[0].productId.image_product[0],
          tanggal: formatTanggal(new Date()),
        });
        return res.status(200).json({ message: "Berhasil Menerima Order" });
      } else {
        if (req.user.role === "konsumen") {
          promisesFunction.push(
            PoinHistory.create({
              userId: req.user.id,
              jenis: "masuk",
              value: biayaTetap.poinPembelian,
              from,
            })
          );
        }
        for (const item of invoice) {
          const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id });
          DetailNotifikasi.create({
            notifikasiId: notifikasi._id,
            status: "Pesanan telah selesai",
            jenis: "Pesanan",
            message: `Klik untuk beri penilaian ${item.invoice.kode_invoice}`,
            image_product: shipments[0].productToDelivers[0].productId.image_product[0],
            kode: item.invoice.kode_invoice,
            redirect: 'detail-transaksi',
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil menyimpan detail notifikasi "))
            .catch(() => console.log("Gagal menyimpan detail notifikasi"));
          socket.emit("notif_pesanan_selesai", {
            jenis: "Pesanan",
            userId: notifikasi.userId,
            status: "Pesanan telah selesai",
            message: `Klik untuk beri penilaian ${item.invoice.kode_invoice}`,
            image: shipments[0].productToDelivers[0].productId.image_product[0],
            tanggal: formatTanggal(new Date()),
          });
        }
        await Promise.all(promisesFunction);

        return res.status(200).json({ message: "Berhasil Menerima Order" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  cancelOrder: async (req, res, next) => {
    try {
      const { pesananId, reason } = req.body;
      const invoice = await Transaksi.aggregate([
        { $match: { id_pesanan: new mongoose.Types.ObjectId(pesananId) } },
        { $project: { _id: 1 } },
        {
          $lookup: {
            from: "invoices",
            let: { id_transaksi: "$_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$id_transaksi", "$$id_transaksi"] } } }],
            as: "invoice",
          },
        },
        { $unwind: "$invoice" },
      ]);
      // return res.status(200).json(invoice)
      const order = await Pesanan.findOneAndUpdate(
        { _id: pesananId, userId: req.user.id },
        {
          status: "Dibatalkan",
          reason,
          canceledBy: "pengguna",
        }
      ).populate("items.product.productId");
      // return res.status(200).json()
      const detailPesanan = await DetailPesanan.exists({ id_pesanan: pesananId });
      await axios.post(
        `https://api.sandbox.midtrans.com/v2/${detailPesanan._id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Basic ${btoa(process.env.SERVERKEY + ":")}`,
          },
        }
      );
      await VA_Used.deleteOne({ orderId: pesananId, userId: req.user.id });
      if (!order) return res.status(404).json({ message: `Tidak ada order dengan id ${pesananId}` });
      if (invoice.length == 1) {
        const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id });
        const detailNotifikasi = await DetailNotifikasi.create({
          notifikasiId: notifikasi._id,
          status: "Pesanan dibatalkan",
          jenis: "Info",
          message: `${invoice[0].invoice.kode_invoice} telah dibatalkan oleh kamu`,
          image_product: order.items[0].product[0].productId.image_product[0],
          kode: invoice[0].invoice.kode_invoice,
          redirect: 'detail-transaksi',
          createdAt: new Date(),
        });
        socket.emit("notif_pesanan_dibatalkan", {
          jenis: detailNotifikasi.jenis,
          userId: notifikasi.userId,
          status: detailNotifikasi.status,
          message: detailNotifikasi.message,
          image: detailNotifikasi.image_product,
          tanggal: formatTanggal(detailNotifikasi.createdAt),
        });
        return res.status(200).json({ message: "Berhasil Membatalkan Pesanan" });
      } else {
        for (const item of invoice) {
          const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id });
          const detailNotifikasi = await DetailNotifikasi.create({
            notifikasiId: notifikasi._id,
            status: "Pesanan dibatalkan",
            jenis: "Info",
            message: `${item.invoice.kode_invoice} telah dibatalkan oleh kamu`,
            image_product: order.items[0].product[0].productId.image_product[0],
            kode: item.invoice.kode_invoice,
            redirect: 'detail-transaksi',
            createdAt: new Date(),
          });
          socket.emit("notif_pesanan_dibatalkan", {
            jenis: detailNotifikasi.jenis,
            userId: notifikasi.userId,
            status: detailNotifikasi.status,
            message: detailNotifikasi.message,
            image: detailNotifikasi.image_product,
            tanggal: formatTanggal(detailNotifikasi.createdAt),
          });
        }
        return res.status(200).json({ message: "Berhasil Membatalkan Pesanan" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  deleteOrder: async (req, res, next) => {
    try {
      const dataOrder = await Orders.findOne({ _id: req.params.id });
      if (dataOrder.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa menghapus data orang lain!" });

      if (!dataOrder) return res.status(404).json({ error: "darta order not Found" });

      await Orders.deleteOne({ _id: req.params.id });

      return res.status(200).json({ message: "delete data Order success" });
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      next(error);
    }
  },
};
