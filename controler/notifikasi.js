const Pengiriman = require("../models/model-pengiriman");
const Pesanan = require("../models/pesanan/model-orders");
const DataProductOrder = require("../models/pesanan/model-data-product-order");
const Invoice = require("../models/model-invoice");
const ProsesPengirimanDistributor = require("../models/distributor/model-proses-pengiriman");
const User = require("../models/model-auth-user");
const Konsumen = require("../models/konsumen/model-konsumen");
const Vendor = require("../models/vendor/model-vendor");
const Supplier = require("../models/supplier/model-supplier");
const Notifikasi = require("../models/notifikasi/notifikasi");
const Product = require("../models/model-product");
const DetailNotifikasi = require("../models/notifikasi/detail-notifikasi");
const Pengemasan = require("../models/model-pengemasan");
const { Transaksi } = require("../models/model-transaksi");
const { io } = require("socket.io-client");
const mongoose = require("mongoose");

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
const date = `${yyyy}-${mm}-${dd}`;
const minutes = `${hh}:${mn}:${ss}`;

function formatTanggal(tanggal) {
  const dd = String(tanggal.getDate()).padStart(2, "0");
  const mm = String(tanggal.getMonth() + 1).padStart(2, "0");
  const yyyy = tanggal.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function formatWaktu(waktu) {
  const hh = String(waktu.getHours()).padStart(2, "0");
  const mn = String(waktu.getMinutes()).padStart(2, "0");
  const ss = String(waktu.getSeconds()).padStart(2, "0");
  return `${hh}:${mn}:${ss}`;
}

const socket = io(process.env.WEBSOCKET, {
  auth: {
    fromServer: true,
  },
});

module.exports = {
  getDetailNotif: async (req, res, next) => {
    try {
     console.log(req.user)
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
        const pengiriman = await Pengiriman.find({ orderId: order._id }).populate("distributorId").populate("invoice").lean();
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
      let filteredData = data.forEach((dt) => {
        console.log("data" ,dt);
      });

      return res.status(200).json({ message: "get data all Order success", data: filteredData });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  getNotifikasi: async (req, res, next) => {
    try {
      const notifikasi = await DetailNotifikasi.aggregate([
        {
          $lookup: {
            from: "notifikasis",
            let: { id: "$notifikasiId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id"] },
                },
              },
            ],
            as: "notif",
          },
        },
        { $unwind: "$notif" },
        {
          $match: {
            "notif.userId": new mongoose.Types.ObjectId(req.user.id),
          },
        },
        {
          $lookup: {
            from: "invoices",
            let: { id: "$notif.invoiceId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id"] },
                },
              },
            ],
            as: "invoice",
          },
        },
        { $unwind: "$invoice" },
        {
          $lookup: {
            from: "transaksis",
            let: { id: "$invoice.id_transaksi" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id"] },
                },
              },
            ],
            as: "transaksi",
          },
        },
        { $unwind: "$transaksi" },
        {
          $addFields: {
            id_pesanan: "$transaksi.id_pesanan",
          },
        },
        {
          $project: {
            _id: 1,
            notifikaisiId: 1,
            status: 1,
            message: 1,
            jenis: 1,
            image_product: 1,
            is_read: 1,
            createdAt: 1,
            id_pesanan: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
      return res.status(200).json({ total: notifikasi.length, notifikasi });
    } catch (error) {
      console.log(error);
    }
  },

  sendNotifikasi: async (req, res, next) => {
    try {
      const shipments = await Pengiriman.find({ sellerApproved: true }).sort({ createdAt: -1 }).populate("invoice").populate("productToDelivers.productId").populate("distributorId").lean();
      for (const shipment of shipments) {
        const deadline = new Date(shipment.waktu_pengiriman);
        const countdown_pengemasan_vendor = new Date(shipment.waktu_pengiriman).setHours(new Date(shipment.waktu_pengiriman).getHours() - 2);
        const pengemasan = await Pengemasan.findOne({ pengirimanId: shipment._id }).lean();

        const total_pengemasan_pengiriman = pengemasan?.total_pengemasan_pengiriman * 1000;
        const waktuMunculNotif = new Date(deadline.getTime() - total_pengemasan_pengiriman);
        const now = new Date();

        const yesterdayDeadline = new Date(deadline);
        yesterdayDeadline.setDate(yesterdayDeadline.getDate() - 1);

        const notifikasiDistri = await Notifikasi.findOne({ userId: shipment.distributorId.userId });

        if (now.setSeconds(0, 0) == yesterdayDeadline.setSeconds(0, 0)) {
          DetailNotifikasi.create({
            notifikasiId: notifikasiDistri._id,
            status: "Ada pesanan yang harus dikirim besok",
            message: `Yuk jangan lupa ada pengiriman pesanan ${shipment.kode_pengiriman} yang harus dikirim besok`,
            jenis: "Pesanan",
            image_product: shipment.productToDelivers[0].productId.image_product[0],
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil simpan detail notif distributor"))
            .catch(() => consol.log("Gagal simpan detail notif distributor"));

          socket.emit("notif_distri_h-1_pengiriman", {
            jenis: "Pesanan",
            userId: shipment.distributorId.userId,
            status: "Ada pesanan yang harus dikirim besok",
            message: `Yuk jangan lupa ada pengiriman pesanan ${shipment.kode_pengiriman} yang harus dikirim besok`,
            image: shipment.productToDelivers[0].productId.image_product[0],
            tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
          });
        }

        const notifikasi = await Notifikasi.findOne({ invoiceId: shipment.invoice._id }).sort({ createdAt: -1 });
        if (now.setSeconds(0, 0) == waktuMunculNotif.setSeconds(0, 0)) {
          await Pengiriman.findOneAndUpdate({ _id: shipment._id }, { countdown_pengemasan_vendor: new Date(countdown_pengemasan_vendor) }, { new: true });
          DetailNotifikasi.create({
            notifikasiId: notifikasiDistri._id,
            status: "Pesanan yang akan dikirim sedang dikemas",
            message: `Pengiriman pesanan ${shipment.kode_pengiriman} sedang dikemas oleh penjual dan akan segera kamu kirim ke konsumen`,
            jenis: "Pesanan",
            image_product: shipment.productToDelivers[0].productId.image_product[0],
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil simpan notif distri"))
            .catch(() => console.log("Gagal simpan notif distri"));

          DetailNotifikasi.create({
            notifikasiId: notifikasi._id,
            status: "Pesanan sedang dikemas",
            message: `${shipment.invoice.kode_invoice} sedang dikemas oleh penjual dan akan segera dikirim`,
            jenis: "Pesanan",
            image_product: shipment.productToDelivers[0].productId.image_product[0],
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil simpan detail notif konsumen"))
            .catch(() => console.log("Gagal simpan detail notif konsumen"));

          socket.emit("notif_distri_pesanan_dikemas", {
            jenis: "Pesanan",
            userId: notifikasiDistri.userId,
            status: "Pesanan yang akan dikirim sedang dikemas",
            message: `Pengiriman pesanan ${shipment.kode_pengiriman} sedang dikemas olej penjual dan akan segera kamu kirim ke konsumen`,
            image: shipment.productToDelivers[0].productId.image_product[0],
            tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
          });
          socket.emit("notif_pesanan_dikemas", {
            jenis: "Pesanan",
            userId: notifikasi.userId,
            status: "Pesanan sedang dikemas",
            message: `${notifikasi.invoiceId.kode_invoice} sedang dikemas oleh penjual dan akan segera dikirim`,
            image: shipment.productToDelivers[0].productId.image_product[0],
            tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  readNotifikasi: async (req, res, next) => {
    try {
      const detailNotifikasi = await DetailNotifikasi.findByIdAndUpdate(req.params.id, { is_read: true }, { new: true });
      return res.status(200).json({
        message: "Notifikasi terbaca",
        detailNotifikasi,
      });
    } catch (error) {
      console.log(error);
    }
  },
};
