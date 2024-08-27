const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman");
const Pengiriman = require("../../models/model-pengiriman");
const PelacakanDistributorKonsumen = require("../../models/konsumen/pelacakanDistributorKonsumen");
const Distributtor = require("../../models/distributor/model-distributor");
const { Transaksi } = require("../../models/model-transaksi");
const Invoice = require("../../models/model-invoice");
const Notifikasi = require("../../models/notifikasi/notifikasi");
const DetailNotifikasi = require("../../models/notifikasi/detail-notifikasi");
const mergeObjectsByStoreId = require('../../utils/merginPengirimanId')
const User = require('../../models/model-auth-user')
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const { io } = require("socket.io-client");
const Pengemudi = require("../../models/distributor/model-pengemudi");

const socket = io(process.env.HOST, {
  auth: {
    fromServer: true,
  },
});

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

module.exports = {
  getAllProsesPengiriman: async (req, res, next) => {
    try {
      const { status, page = 1, limit = 5 } = req.query;
      const skip = (page - 1) * limit;

      const distributor = await Distributtor.findOne({ userId: req.user.id });
      if (!distributor) return res.status(404).json({ message: "data not FOund" });

      let query = { distributorId: distributor._id };

      if (status) {
        query.status_distributor = status;
      }

      const dataProsesPengirimanDistributor = await ProsesPengirimanDistributor.find(query)
        .populate({
          path: "tokoId",
          populate: "address",
        })
        .populate({
          path: "buyerId",
          populate: "address",
        })
        .populate("jenisPengiriman")
        .populate("jenisKendaraan")
        .populate({
          path: "produk_pengiriman.productId",
          populate: "categoryId",
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })

      if (!dataProsesPengirimanDistributor || dataProsesPengirimanDistributor.length === 0) return res.status(400).json({ message: "data saat ini masi kosong" });

      const datas = [];
      for (let data of dataProsesPengirimanDistributor) {
        const { waktu_pengiriman, ...restOfData } = data;
        let total_qty = 0;
        for (let item of data.produk_pengiriman) {
          total_qty += item.quantity;
        }
        datas.push({
          ...restOfData,
          waktu_pengiriman: new Date(waktu_pengiriman),
          total_qty,
        });
      }

      res.status(200).json({
        message: "data get All success",
        datas: dataProsesPengirimanDistributor,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getDetailProsesPengiriman: async (req, res, next) => {
    try {
      const dataProsesPengirimanDistributor = await ProsesPengirimanDistributor.findOne({ _id: req.params.id })
        .populate({
          path: "tokoId",
          populate: "address",
        })
        .populate({
          path: "sekolahId",
          populate: "address",
        })
        .populate("jenisPengiriman")
        .populate({
          path: "produk_pengiriman.productId",
          populate: "categoryId",
        })
        .populate("jenisKendaraan");

      if (!dataProsesPengirimanDistributor) return res.status(404).json({ message: "Data Not Found" });

      res.status(200).json({
        message: "get detail success",
        data: dataProsesPengirimanDistributor,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  updatePerusahaanPenegmudiDanKendaraan: async (req, res, next) => {
    try {
      const { id_pengemudi, id_kendaraan } = req.body;

      const data = await ProsesPengirimanDistributor.findByIdAndUpdate({ _id: req.params.id }, { id_pengemudi, id_kendaraan }, { new: true });

      res.status(200).json({
        message: "update proses pengiriman distributor",
        data,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  mulaiPenjemputan: async (req, res, next) => {
    try {
      const { id_address, latitude, longitude, id_konsumen, id_pengemudi, id_kendaraan } = req.body;

      if (!id_address || !latitude || !longitude || !id_konsumen || !id_pengemudi || !id_kendaraan) return res.status(400).json({ message: "id_address, latitude, longitude, id_konsumen, id_pengemudi, id_kendaraan harus di isi" });
      const distri = await Distributtor.exists({ userId: req.user.id });

      const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({ _id: req.params.id, distributorId: distri._id }, { status_distributor: "Sedang dijemput", id_pengemudi, id_kendaraan }, { new: true })
        .populate("tokoId")
        .populate("produk_pengiriman.productId");

      const lacak = await PelacakanDistributorKonsumen.create({
        id_toko: prosesPengiriman.tokoId,
        id_address,
        latitude,
        longitude,
        id_distributor: distri._id,
        id_pesanan: req.params.id,
        id_konsumen,
        statusPengiriman: "Pesanan diserahkan ke distributor",
      });

      await Pengiriman.updateOne({ _id: prosesPengiriman.pengirimanId }, { status_pengiriman: "dikirim" });

      const toko_user_id = prosesPengiriman.tokoId.userId;

      const notifikasi = await Notifikasi.findOne({ userId: toko_user_id })

      if (!notifikasi) return res.status(404).json({ message: "notifikasi tidak ditemukan" });

      DetailNotifikasi.create({
        notifikasiId: notifikasi._id,
        status: "Distributor sedang dalam perjalanan menjemput pesanan",
        message: `Pesanan ${prosesPengiriman.kode_pengiriman} akan segera dijemput oleh distributor ke lokasi anda`,
        jenis: "Pesanan",
        image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
        cretedAt: new Date(),
      })
        .then(() => console.log("Berhasil menambahkan notif"))
        .catch(() => console.log("Gagal manambahkan notif"));

      socket.emit("notif_vendor_distributor_menjemput", {
        jenis: "Pesanan",
        userId: toko_user_id,
        status: "Distributor sedang dalam perjalanan menjemput pesanan",
        message: `Pesanan ${prosesPengiriman.kode_pengiriman} akan segera dijemput oleh distributor ke lokasi anda`,
        image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
        waktu: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
      });

      if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

      return res.status(200).json({
        message: "Berhasil Memulai Penjemputan",
        lacak,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  sudahDiJemput: async (req, res, next) => {
    try {
      const { id_address, latitude, longitude, id_konsumen, total_qty } = req.body;
      if (!total_qty || !id_address) return res.status(400).json({ message: "data total_qty dan id_address harus di isi" });

      const distri = await Distributtor.exists({ userId: req.user.id });
      const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({ _id: req.params.id, distributorId: distri._id }, { status_distributor: "Sudah dijemput", total_qty: total_qty }, { new: true })
        .populate("pengirimanId")
        .populate("produk_pengiriman.productId");
      const dataOneProsesPengirirman = await ProsesPengirimanDistributor.findOne({ _id: req.params.id, distributorId: distri._id });

      await PelacakanDistributorKonsumen.updateOne(
        {
          id_toko: dataOneProsesPengirirman.tokoId,
          id_distributor: distri._id,
          id_pesanan: req.params.id,
          id_konsumen,
        },
        {
          id_address,
          latitude,
          longitude,
          statusPengiriman: "Pesanan sedang dalam perjalanan",
          total_qty,
        }
      );

      const invoice = await Transaksi.aggregate([
        { $match: { id_pesanan: new mongoose.Types.ObjectId(prosesPengiriman.pengirimanId.orderId) } },
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

      if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

      if (invoice.length == 1) {
        const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id });
        DetailNotifikasi.create({
          notifikasiId: notifikasi._id,
          status: "Pesanan telah diserahkan ke jasa pengiriman",
          jenis: "Pesanan",
          message: `${prosesPengiriman.kode_pengiriman} telah diserahkan ke jasa pengiriman dan akan segera diantar menuju alamat tujuan`,
          image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan notif"))
          .catch(() => console.log("Gagal menyimpan notif"));

        socket.emit("notif_pesanan_diserahkan", {
          jenis: "Pesanan",
          userId: notifikasi.userId,
          status: "Pesanan telah diserahkan ke jasa pengiriman",
          message: `${prosesPengiriman.kode_pengiriman} telah diserahkan ke jasa pengiriman dan akan segera diantar menuju alamat tujuan`,
          image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          waktu: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
        });
        return res.status(200).json({ message: "Berhasil Menerima Penjemputan" });
      } else {
        for (const item of invoice) {
          const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id });
          DetailNotifikasi.create({
            notifikasiId: notifikasi._id,
            status: "Pesanan telah diserahkan ke jasa pengiriman",
            jenis: "Pesanan",
            message: `${item.invoice.kode_invoice} telah diserahkan ke jasa pengiriman dan akan segera diantar menuju alamat tujuan`,
            image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil menyimpan notif"))
            .catch(() => console.log("Gagal menyimpan notif"));
          socket.emit("notif_pesanan_diserahkan", {
            jenis: "Pesanan",
            userId: notifikasi.userId,
            status: "Pesanan telah diserahkan ke jasa pengiriman",
            message: `${item.invoice.kode_invoice} telah diserahkan ke jasa pengiriman dan akan segera diantar menuju alamat tujuan`,
            image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
            waktu: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
          });
        }
        return res.status(200).json({ message: "Berhasil Menerima Penjemputan" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  mulaiPengiriman: async (req, res, next) => {
    try {
      const distri = await Distributtor.exists({ userId: req.user.id });

      const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate({ _id: req.params.id, distributorId: distri._id }, { status_distributor: "Sedang dikirim" }, { new: true })
        .populate("distributorId")
        .populate("pengirimanId")
        .populate("tokoId")
        .populate("produk_pengiriman.productId")
        .populate("id_pengemudi");
      const invoice = await Transaksi.aggregate([
        { $match: { id_pesanan: new mongoose.Types.ObjectId(prosesPengiriman.pengirimanId.orderId) } },
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

      const toko_vendor_id = prosesPengiriman.tokoId.userId;

      if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

      const notifDistributor = await Notifikasi.findOne({ userId: prosesPengiriman.distributorId.userId }).sort({ createdAt: -1 });
      DetailNotifikasi.create({
        notifikasiId: notifDistributor._id,
        status: `Pesanan sedang dikirim ke alamat tujuan oleh pengemudi ${prosesPengiriman.id_pengemudi.name}`,
        jenis: "Pesanan",
        message: `Pengiriman pesanan ${prosesPengiriman.kode_pengiriman} sedang dikirim ke alamat tujuan konsumen`,
        image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
        createdAt: new Date(),
      })
        .then(() => console.log("Berbayar simpan notif distributor"))
        .catch(() => console.log("Gagal simpan notif distributor"));

      socket.emit("notif_distri_pesanan_dikirim", {
        jenis: "Pesanan",
        userId: notifDistributor.userId,
        status: `Pesanan sedang dikirim ke alamat tujuan oleh pengemudi ${prosesPengiriman.id_pengemudi.name}`,
        message: `Pengiriman pesanan ${prosesPengiriman.kode_pengiriman} sedang dikirim ke alamat tujuan konsumen`,
        image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
        Waktu: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
      })

      if (invoice.length == 1) {
        const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id });
        DetailNotifikasi.create({
          notifikasiId: notifikasi._id,
          status: "Pesanan sedang dalam pengiriman",
          jenis: "Pesanan",
          message: `${invoice[0].invoice.kode_invoice} sedang dalam perjalanan ke alamat tujuan`,
          image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan notif"))
          .catch(() => console.log("Gagal menyimpan notif"));

        socket.emit("notif_pesanan_dikirim", {
          jenis: "Pesanan",
          userId: notifikasi.userId,
          status: "Pesanan sedang dalam pengiriman",
          message: `${invoice[0].invoice.kode_invoice} sedang dalam perjalanan ke alamat tujuan`,
          image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          waktu: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
        });

        const notifikasiTokoVendor = await Notifikasi.findOne({ userId: toko_vendor_id }).populate("invoiceId");

        DetailNotifikasi.create({
          notifikasiId: notifikasiTokoVendor._id,
          status: "Pesanan sedang dalam pengiriman ke konsumen",
          jenis: "Pesanan",
          message: `Pesanan ${prosesPengiriman.kode_pengiriman} sedang dalam perjalanan menuju alamat tujuan konsumen`,
          image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan notif"))
          .catch(() => console.log("Gagal menyimpan notif"));

        socket.emit("notif_vendor_pesanan_dikirim", {
          jenis: "Pesanan",
          userId: toko_vendor_id,
          status: "Pesanan sedang dalam pengiriman ke konsumen",
          message: `Pesanan ${prosesPengiriman.kode_pengiriman} sedang dalam perjalanan menuju alamat tujuan konsumen`,
          image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          waktu: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
        });
        return res.status(200).json({ message: "Berhasil Memulai Pengiriman" });
      } else {
        const notifikasiTokoVendor = await Notifikasi.findOne({ userId: toko_vendor_id }).populate("invoiceId");

        DetailNotifikasi.create({
          notifikasiId: notifikasiTokoVendor._id,
          status: "Pesanan sedang dalam pengiriman ke konsumen",
          jenis: "Pesanan",
          message: `Pesanan ${prosesPengiriman.kode_pengiriman} sedang dalam perjalanan menuju alamat tujuan konsumen`,
          image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan notif"))
          .catch(() => console.log("Gagal menyimpan notif"));

        socket.emit("notif_vendor_pesanan_dikirim", {
          jenis: "Pesanan",
          userId: toko_vendor_id,
          status: "Pesanan sedang dalam pengiriman ke konsumen",
          message: `Pesanan ${prosesPengiriman.kode_pengiriman} sedang dalam perjalanan menuju alamat tujuan konsumen`,
          image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          waktu: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
        });
        for (const item of invoice) {
          const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id });
          DetailNotifikasi.create({
            notifikasiId: notifikasi._id,
            status: "Pesanan sedang dalam pengiriman",
            jenis: "Pesanan",
            message: `${item.invoice.kode_invoice} sedang dalam perjalanan ke alamat tujuan`,
            image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil menyimpan notif"))
            .catch(() => console.log("Gagal menyimpan notif"));

          socket.emit("notif_pesanan_dikirim", {
            jenis: "Pesanan",
            userId: notifikasi.userId,
            status: "Pesanan sedang dalam pengiriman",
            message: `${item.invoice.kode_invoice} sedang dalam perjalanan ke alamat tujuan`,
            image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
            tanggal: formatTanggal(new Date()),
          });
        }
        return res.status(200).json({ message: "Berhasil Memulai Pengiriman" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  pesasanSelesai: async (req, res, next) => {
    try {
      const { id_address, latitude, longitude, id_konsumen } = req.body;
      const files = req.files;
      const images = files ? files.images : null;

      const imageNameProfile = `${Date.now()}${path.extname(images.name)}`;
      const imagePathProfile = path.join(__dirname, "../../public/ulasan-produk", imageNameProfile);

      await images.mv(imagePathProfile);

      const distri = await Distributtor.exists({ userId: req.user.id });

      const prosesPengiriman = await ProsesPengirimanDistributor.findOneAndUpdate(
        { _id: req.params.id, distributorId: distri._id },
        { status_distributor: "Selesai", image_pengiriman: `${process.env.HOST}public/ulasan-produk/${imageNameProfile}` },
        { new: true }
      )
        .populate("distributorId")
        .populate("pengirimanId")
        .populate("tokoId")
        .populate("produk_pengiriman.productId");
      if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

      await PelacakanDistributorKonsumen.updateOne(
        {
          id_toko: prosesPengiriman.tokoId,
          id_address,
          latitude,
          longitude,
          id_distributor: distri._id,
          id_pesanan: req.params.id,
          id_konsumen,
        },
        {
          statusPengiriman: "Pesanan telah diterima konsumen",
          image_pengiriman: `${process.env.HOST}public/ulasan-produk/${imageNameProfile}`,
          update_date_pesanan_selesai: new Date(),
        }
      );

      await Pengiriman.updateMany({ _id: { $in: prosesPengiriman.pengirimanId } }, { status_pengiriman: "pesanan selesai" });

      const invoice = await Transaksi.aggregate([
        { $match: { id_pesanan: new mongoose.Types.ObjectId(prosesPengiriman.pengirimanId.orderId) } },
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

      const notifDistributor = await Notifikasi.findOne({ userId: prosesPengiriman.distributorId._id }).sort({ createdAt: -1 });

      DetailNotifikasi.create({
        notifikasiId: notifDistributor.id,
        status: "Pesanan telah selesai dikirim",
        jenis: "Pesanan",
        message: `Pengiriman pesanan ${prosesPengiriman.kode_pengiriman} telah dikirim ke alamat tujuan`,
        image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
        createdAt: new Date(),
      })
        .then(() => console.log("Berhasil simpan notif distributor"))
        .catch(() => console.log("Gagal simpan notif distributor"))

      socket.emit('notif_distri_pesanan_selesai', {
        jenis: "Pesanan",
        userId: notifDistributor.userId,
        status: "Pesanan telah selesai dikirim",
        message: `Pengiriman pesanan ${prosesPengiriman.kode_pengiriman} telah dikirim ke alamat tujuan`,
        image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
        tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
      })
      const toko_user_id = prosesPengiriman.tokoId.userId;
      if (!prosesPengiriman) return res.status(404).json({ message: "Proses pengiriman tidak ditemukan" });

      if (invoice.length == 1) {
        const notifikasi = await Notifikasi.findOne({ invoiceId: invoice[0].invoice._id });
        DetailNotifikasi.create({
          notifikasiId: notifikasi._id,
          status: "Pesanan telah diterima oleh konsumen",
          jenis: "Pesanan",
          message: `${invoice[0].invoice.kode_invoice} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
          image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan notif"))
          .catch(() => console.log("Gagal menyimpan notif"));

        socket.emit("notif_pesanan_diterima", {
          jenis: "Pesanan",
          userId: notifikasi.userId,
          status: "Pesanan telah diterima oleh konsumen",
          message: `${invoice[0].invoice.kode_invoice} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
          image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          tanggal: formatTanggal(new Date()),
        });

        const notifikasiVendor = await Notifikasi.findOne({ userId: toko_user_id }).populate("invoiceId");
        DetailNotifikasi.create({
          notifikasiId: notifikasiVendor._id,
          status: "Pesanan telah diterima oleh konsumen",
          jenis: "Pesanan",
          message: `${prosesPengiriman.kode_pengiriman} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
          image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan notif"))
          .catch(() => console.log("Gagal menyimpan notif"));

        socket.emit("notif_pesanan_dikirim", {
          jenis: "Pesanan",
          userId: notifikasi.userId,
          status: "Pesanan telah diterima oleh konsumen",
          message: `${prosesPengiriman.kode_pengiriman} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
          image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          tanggal: formatTanggal(new Date()),
        });

        return res.status(200).json({ message: "Berhasil Menyelesaikan Pengiriman" });
      } else {
        const notifikasiVendor = await Notifikasi.findOne({ userId: toko_user_id })
        DetailNotifikasi.create({
          notifikasiId: notifikasiVendor._id,
          status: "Pesanan telah diterima oleh konsumen",
          jenis: "Pesanan",
          message: `${prosesPengiriman.kode_pengiriman} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
          image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          createdAt: new Date(),
        })
          .then(() => console.log("Berhasil menyimpan notif"))
          .catch(() => console.log("Gagal menyimpan notif"));

        socket.emit("notif_pesanan_dikirim", {
          jenis: "Pesanan",
          userId: notifikasiVendor.userId,
          status: "Pesanan telah diterima oleh konsumen",
          message: `${prosesPengiriman.kode_pengiriman} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
          image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
          tanggal: formatTanggal(new Date()),
        });
        for (const item of invoice) {
          const notifikasi = await Notifikasi.findOne({ invoiceId: item.invoice._id });
          DetailNotifikasi.create({
            notifikasiId: notifikasi._id,
            status: "Pesanan telah diterima oleh konsumen",
            jenis: "Pesanan",
            message: `${item.invoice.kode_invoice} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
            image_product: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
            createdAt: new Date(),
          })
            .then(() => console.log("Berhasil menyimpan notif"))
            .catch(() => console.log("Gagal menyimpan notif"));

          socket.emit("notif_pesanan_diterima", {
            jenis: "Pesanan",
            userId: notifikasi.userId,
            status: "Pesanan telah diterima oleh konsumen",
            message: `${item.invoice.kode_invoice} telah tiba ditujuan, pesanan telah diterima oleh konsumen`,
            image: prosesPengiriman.produk_pengiriman[0].productId.image_product[0],
            tanggal: formatTanggal(new Date()),
          });
        }
        return res.status(200).json({
          message: "Berhasil Menyelesaikan Pengiriman",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
