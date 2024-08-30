const Product = require("../models/model-product");
const Supplier = require("../models/supplier/model-supplier");
const Produsen = require("../models/produsen/model-produsen");
const Vendor = require("../models/vendor/model-vendor");
const TokoVendor = require("../models/vendor/model-toko");
const TokoSupplier = require("../models/supplier/model-toko");
const Address = require("../models/model-address");
const BiayaTetap = require("../models/model-biaya-tetap");
const { calculateDistance } = require("../utils/menghitungJarak");
// const Address = require("../models/model-address");
// const { Pangan } = require("../models/model-pangan");

const mongoose = require("mongoose");
const SpecificCategory = require("../models/model-specific-category");
const SubCategory = require("../models/model-sub-category");
const MainCategory = require("../models/model-main-category");
const Promo = require("../models/model-promo");
const Performance = require("../models/model-laporan-kinerja-product");
const path = require("path");
const jwt = require("../utils/jwt");
const { getToken } = require("../utils/getToken");
const SalesReport = require("../models/model-laporan-penjualan");
const Pesanan = require("../models/pesanan/model-orders");
const { Pangan, KelompokPangan, KebutuhanGizi } = require("../models/model-pangan");
const { pipeline } = require("stream");
const { vendor } = require("../midelware/user-role-clasification");
const formatNumber = require("../utils/formatAngka");
const Pengiriman = require("../models/model-pengiriman");
const Wishlist = require("../models/model-wishlist");
const TokoProdusen = require("../models/produsen/model-toko");
// const BahanBaku = require("../models/model-bahan-baku");

module.exports = {
  getProductWithSpecific: async (req, res, next) => {
    try {
      if (!new mongoose.Types.ObjectId(req.params.id)) return res.status(400).json({ message: `Id yang dikirimkan tidak valid ${id}` });
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: "Tolong kirimkan id specific category" });
      const products = await Product.find({ categoryId: id }).populate("categoryId").populate("id_main_category").populate("id_sub_category");
      return res.status(200).json({ message: "Berhasil mendapatkan Products", data: products });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getProductWithSub: async (req, res, next) => {
    try {
      if (!new mongoose.Types.ObjectId(req.params.id)) return res.status(400).json({ message: `Id yang dikirimkan tidak valid ${id}` });
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: "Tolong kirimkan id sub category" });
      const products = await Product.find({ id_sub_category: id }).populate("categoryId").populate("id_main_category").populate("id_sub_category");
      return res.status(200).json({ message: "Berhasil mendapatkan Products", data: products });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  verifyOrBlockProduct: async (req, res, next) => {
    try {
      let update;
      if (req.body.verify) {
        update = await Product.findByIdAndUpdate(req.params.id, {
          "status.value": "terpublish",
        });
      } else if (req.body.block) {
        console.log("ditolak ni", req.body);
        update = await Product.findByIdAndUpdate(req.params.id, {
          $set: {
            status: {
              value: "diblokir",
              message: req.body.message,
            },
          },
        });
      } else if (req.body.tolak) {
        update = await Product.findByIdAndUpdate(req.params.id, {
          $set: {
            status: {
              value: "ditolak",
              message: req.body.message,
            },
          },
        });
      }
      return res.status(200).json({ message: "Berhasil memperbarui product", data: update });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getAllProductWithMain: async (req, res, next) => {
    try {
      const datas = await Product.find({ id_main_category: req.params.id })
        .select("name_product total_price userId rating image_product")
        .populate({
          path: "id_main_category",
          select: "name",
        })
        .populate({
          path: "id_sub_category",
          select: "name contents",
          populate: {
            path: "contents",
            select: "name",
          },
        })
        .populate({
          path: "categoryId",
          select: "name",
        })
        .populate({
          path: "userId",
          select: "_id role",
        })
        .lean();
      for (const produk of datas) {
        switch (produk.userId.role) {
          case "vendor":
            produk.namaToko = await TokoVendor.findOne({ userId: produk.userId._id }).select("namaToko").populate({
              path: "address",
              select: "regency",
            });
            break;
          case "supplier":
            produk.namaToko = await Supplier.findOne({ userId: produk.userId._id }).select("namaToko").populate({
              path: "address",
              select: "regency",
            });
            break;
          case "produsen":
            produk.namaToko = await Produsen.findOne({ userId: produk.userId._id }).select("namaToko").populate({
              path: "address",
              select: "regency",
            });
            break;
        }
      }

      return res.status(200).json({ message: "Berhasil Mendapatkan semua data produk dengan main category", datas });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getProductWithMain: async (req, res, next) => {
    try {
      if (!new mongoose.Types.ObjectId(req.params.id)) return res.status(404).json({ message: `Invalid category id: ${req.params.id}` });
      const id = new mongoose.Types.ObjectId(req.params.id);
      const biayaTetap = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" }).select("radius");

      const alamatSekolah = await Address.findOne({ userId: req.user.id, isUsed: true });
      console.log(alamatSekolah, req.user.id)
      let sellers;

      switch(req.user.role){
        case "konsumen":
          sellers = await TokoVendor.aggregate([
            {
              $lookup: {
                from: "addresses",
                let: { address: "$address" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$address"] } } }],
                as: "address",
              },
            },
            {
              $unwind: "$address",
            },
          ]);
          break;
        case "vendor":
          sellers = await TokoSupplier.aggregate([
            {
              $lookup: {
                from: "addresses",
                let: { address: "$address" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$address"] } } }],
                as: "address",
              },
            },
            {
              $unwind: "$address",
            },
          ]);
          break;
        case "supplier":
          sellers = await TokoProdusen.aggregate([
            {
              $lookup: {
                from: "addresses",
                let: { address: "$address" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$address"] } } }],
                as: "address",
              },
            },
            {
              $unwind: "$address",
            },
          ]);
          break;
      }

      const longAlamatSekolah = parseFloat(alamatSekolah.pinAlamat.long);
      const latAlamatSekolah = parseFloat(alamatSekolah.pinAlamat.lat);

      let sellerDalamRadius = [];

      for (let i = 0; i < sellers.length; i++) {
        const distance = await calculateDistance(latAlamatSekolah, longAlamatSekolah, parseFloat(sellers[i].address.pinAlamat.lat), parseFloat(sellers[i].address.pinAlamat.long), biayaTetap.radius);
        if (distance <= biayaTetap.radius) {
          sellerDalamRadius.push(sellers[i]);
          sellers[i].jarakVendor = distance;
        }
      }

      const idSellers = sellerDalamRadius.map((item) => new mongoose.Types.ObjectId(item.userId));

      const dataProds = await Product.aggregate([
        {
          $match: {
            id_main_category: id,
            "status.value": "terpublish",
            total_stok: { $gt: 0 },
            $expr: { $gte: ["$total_stok", "$minimalOrder"] },
            userId: {
              $in: idSellers
            }
          },
        },
        {
          $project: { description: 0, id_main_category: 0, id_sub_category: 0, categoryId: 0, pemasok: 0 },
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, { $project: { _id: 1, role: 1 } }],
            as: "userData",
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $lookup: {
            from: "tokovendors",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { namaToko: 1, profile_pict: 1, address: 1 } }],
            as: "vendorData",
          },
        },
        {
          $lookup: {
            from: "tokosuppliers",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { namaToko: 1, profile_pict: 1, address: 1 } }],
            as: "supplierData",
          },
        },
        {
          $lookup: {
            from: "tokoprodusens",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { namaToko: 1, profile_pict: 1, address: 1 } }],
            as: "produsenDatas",
          },
        },
        {
          $addFields: {
            dataToko: {
              $cond: {
                if: { $gt: [{ $size: "$vendorData" }, 0] },
                then: { $arrayElemAt: ["$vendorData", 0] },
                else: {
                  $cond: {
                    if: { $gt: [{ $size: "$supplierData" }, 0] },
                    then: { $arrayElemAt: ["$supplierData", 0] },
                    else: { $arrayElemAt: ["$produsenDatas", 0] },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            vendorData: 0,
            supplierData: 0,
            produsenDatas: 0,
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "dataToko.address",
            foreignField: "_id",
            as: "alamatToko",
          },
        },
        {
          $addFields: {
            "dataToko.alamat": { $arrayElemAt: ["$alamatToko", 0] },
          },
        },
        {
          $lookup: {
            from: "salesreports",
            localField: "_id",
            foreignField: "productId",
            as: "terjual",
          },
        },
        {
          $unwind: { path: "$terjual", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            terjual: {
              $ifNull: [
                {
                  $reduce: {
                    input: { $ifNull: ["$terjual.track", []] },
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.soldAtMoment"] },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $project: { alamatToko: 0 },
        },
        {
          $project: { userData: 0 },
        },
      ]);

      const productIds = dataProds.map((item) => {
        return item._id;
      });
      const banners = await Promo.find({ productId: { $in: productIds } });
      let productFlashSale;
      let productNotFlashSale;
      productFlashSale = dataProds.filter((item) => {
        return item.isFlashSale;
      });
      productNotFlashSale = dataProds.filter((item) => {
        return !item.isFlashSale;
      });

      return res.status(200).json({
        message: "Berhasil Mendapatkan Data",
        productFlashSale,
        productNotFlashSale,
        banners,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getProductWithRadiusKonsumen: async (req, res, next) => {
    try {
      const { wishlist } = req.query

      const biayaTetap = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" }).select("radius");

      const alamatDefault = await Address.findOne({ userId: req.user.id, isUsed: true });
      if (!alamatDefault) {
        return res.status(500).json({
          message: "Alamat default"
        })
      }
      let sellers;

      switch(req.user.role){
        case "konsumen":
          sellers = await TokoVendor.aggregate([
            {
              $lookup: {
                from: "addresses",
                let: { address: "$address" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$address"] } } }],
                as: "address",
              },
            },
            {
              $unwind: "$address",
            },
          ]);
          break;
        case "vendor":
          sellers = await TokoSupplier.aggregate([
            {
              $lookup: {
                from: "addresses",
                let: { address: "$address" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$address"] } } }],
                as: "address",
              },
            },
            {
              $unwind: "$address",
            },
          ]);
          break;
        case "supplier":
          sellers = await TokoProdusen.aggregate([
            {
              $lookup: {
                from: "addresses",
                let: { address: "$address" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$address"] } } }],
                as: "address",
              },
            },
            {
              $unwind: "$address",
            },
          ]);
          break;
      }

      const longalamatDefault = parseFloat(alamatDefault.pinAlamat.long);
      const latalamatDefault = parseFloat(alamatDefault.pinAlamat.lat);

      const sellerDalamRadius = await Promise.all(
        sellers.map(async (seller) => {
          const distance = await calculateDistance(
            latalamatDefault, 
            longalamatDefault, 
            parseFloat(seller.address.pinAlamat.lat), 
            parseFloat(seller.address.pinAlamat.long), 
            biayaTetap.radius
          );
          
          if (!isNaN(distance)) {
            return seller;
          } else {
            return null;
          }
        })
      )

      
      const idVendors = sellerDalamRadius
      .filter(seller => seller !== null)
      .map((item) => new mongoose.Types.ObjectId(item.userId));

      let filter = {
        $match: {
          userId: {
            $in: idVendors,
          },
        },
      }
      console.log(Boolean(wishlist))
      if (Boolean(wishlist)) {
        const user_wishlist = (await Wishlist.find({ userId: req.user.id }).lean()).map(prd => prd.productId);
        console.log(user_wishlist)
        if (user_wishlist.length > 0) {
          filter.$match._id = { $nin: user_wishlist };
        }
      }

      const productWithRadius = await Product.aggregate([
        filter,
        {
          $project: { id_main_category: 0, id_sub_category: 0, categoryId: 0 },
        },
        {
          $lookup: {
            from: "tokovendors",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { namaToko: 1, profile_pict: 1, address: 1 } }],
            as: "vendorData",
          },
        },
        {
          $lookup: {
            from: "tokosuppliers",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { namaToko: 1, profile_pict: 1, address: 1 } }],
            as: "supplierData",
          },
        },
        {
          $lookup: {
            from: "tokoprodusens",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { namaToko: 1, profile_pict: 1, address: 1 } }],
            as: "produsenDatas",
          },
        },
        {
          $addFields: {
            dataToko: {
              $cond: {
                if: { $gt: [{ $size: "$vendorData" }, 0] },
                then: { $arrayElemAt: ["$vendorData", 0] },
                else: {
                  $cond: {
                    if: { $gt: [{ $size: "$supplierData" }, 0] },
                    then: { $arrayElemAt: ["$supplierData", 0] },
                    else: { $arrayElemAt: ["$produsenDatas", 0] },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            vendorData: 0,
            supplierData: 0,
            produsenDatas: 0,
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "dataToko.address",
            foreignField: "_id",
            as: "alamatToko",
          },
        },
        {
          $addFields: {
            "dataToko.alamat": { $arrayElemAt: ["$alamatToko", 0] },
          },
        },
        {
          $lookup: {
            from: "salesreports",
            localField: "_id",
            foreignField: "productId",
            as: "terjual",
          },
        },
        {
          $unwind: {
            path: "$terjual",
            preserveNullAndEmptyArrays: true
          },
        },
        {
          $addFields: {
            terjual: {
              $reduce: {
                input: {
                  $ifNull: ["$terjual.track", []], // Jika `terjual` null, maka gunakan array kosong
                },
                initialValue: 0,
                in: {
                  $add: ["$$value", "$$this.soldAtMoment"],
                },
              },
            },
          },
        },
        {
          $project: { alamatToko: 0 },
        },
        {
          $sort: { poin_review: -1 },
        },
      ]);

      const productIds = productWithRadius.map((item) => {
        return item._id;
      });

      const banners = await Promo.find({ productId: { $in: productIds } });
      let productFlashSale;
      let productNotFlashSale;

      productFlashSale = productWithRadius.filter((item) => {
        return item.isFlashSale;
      });

      productNotFlashSale = productWithRadius.filter((item) => {
        return !item.isFlashSale;
      });

      res.status(200).json({
        message: "Berhasil mendapatkan data",
        productFlashSale,
        productNotFlashSale,
        banners,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  search: async (req, res, next) => {
    try {
      function auth() {
        const token = getToken(req);

        const verifyToken = jwt.verifyToken(token);
        if (!verifyToken) return null;
        return verifyToken;
      }

      const { name, category } = req.query;
      let handlerFilter = {};

      if (name) {
        handlerFilter = {
          ...handlerFilter,
          name_product: { $regex: new RegExp(name, "i") },
        };
      }

      if (category) {
        const categoryResoul = await SpecificCategory.findOne({
          name: { $regex: category, $options: "i" },
        });

        if (!categoryResoul) return res.status(404).json({ message: `Tidak Ditemukan product dengan kategori ${category}` });
        handlerFilter = { ...handlerFilter, categoryId: categoryResoul._id };
      }

      const nama_toko = await TokoVendor.find().populate("address").lean();
      const list_product = await Product.find(handlerFilter).populate("userId", "-password").populate("categoryId").lean();

      req.user = auth();
      let datas = [];

      if (!req.user) {
        datas = list_product.filter((data) => data.userId && data.userId.role === "vendor");
      } else {
        datas = list_product
          .filter((data) => {
            if (!data.userId) return false;

            switch (req.user.role) {
              case "konsumen":
                return data.userId.role === "vendor";
              case "vendor":
                return data.userId.role === "supplier";
              case "supplier":
                return data.userId.role === "produsen";
              default:
                return false;
            }
          })
          .map((product) => {
            const toko = nama_toko.find((toko) => toko.userId.toString() === product.userId._id.toString());
            return {
              ...product,
              toko,
            };
          });
      }

      if ((!list_product || list_product.length === 0) && (!nama_toko || nama_toko.length === 0)) {
        return res.status(404).json({ message: `Product dengan nama ${name} serta dengan kategori ${category} tidak ditemukan` });
      }

      return res.status(200).json({ datas });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  filterProduk: async (req, res, next) => {
    try {
      const { minPrice, maxPrice, penilaian, main_cat, sub_cat } = req.query;
      const filter = {
        "status.value": "terpublish",
        total_stok: { $gt: 0 },
        $expr: { $gte: ["$total_stok", "$minimalOrder"] },
      };

      if (minPrice) {
        filter.total_price = { ...filter.total_price, $gte: Number(minPrice) };
      }

      if (maxPrice) {
        filter.total_price = { ...filter.total_price, $lte: Number(maxPrice) };
      }

      if (penilaian) {
        filter.poin_ulasan = { ...filter.poin_ulasan, $gte: Number(penilaian) };
      }

      if (main_cat) {
        filter.id_main_category = new mongoose.Types.ObjectId(main_cat);
      }

      if (sub_cat) {
        filter.id_sub_category = new mongoose.Types.ObjectId(sub_cat);
      }

      const products = await Product.aggregate([
        {
          $match: filter,
        },
        {
          $project: { description: 0, id_main_category: 0, id_sub_category: 0, categoryId: 0, pemasok: 0 },
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, { $project: { _id: 1, role: 1 } }],
            as: "userData",
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $lookup: {
            from: "tokovendors",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { namaToko: 1, profile_pict: 1, address: 1 } }],
            as: "vendorData",
          },
        },
        {
          $lookup: {
            from: "suppliers",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { _id: 1, nama: 1, namaBadanUsaha: 1, address: 1 } }],
            as: "supplierData",
          },
        },
        {
          $lookup: {
            from: "produsens",
            let: { userId: "$userId" },
            pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userId"] } } }, { $project: { _id: 1, nama: 1, namaBadanUsaha: 1, address: 1 } }],
            as: "produsenDatas",
          },
        },
        {
          $addFields: {
            dataToko: {
              $cond: {
                if: { $gt: [{ $size: "$vendorData" }, 0] },
                then: { $arrayElemAt: ["$vendorData", 0] },
                else: {
                  $cond: {
                    if: { $gt: [{ $size: "$supplierData" }, 0] },
                    then: { $arrayElemAt: ["$supplierData", 0] },
                    else: { $arrayElemAt: ["$produsenDatas", 0] },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            vendorData: 0,
            supplierData: 0,
            produsenDatas: 0,
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "dataToko.address",
            foreignField: "_id",
            as: "alamatToko",
          },
        },
        {
          $addFields: {
            "dataToko.alamat": { $arrayElemAt: ["$alamatToko", 0] },
          },
        },
        {
          $lookup: {
            from: "salesreports",
            localField: "_id",
            foreignField: "productId",
            as: "terjual",
          },
        },
        {
          $unwind: { path: "$terjual", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            terjual: {
              $ifNull: [
                {
                  $reduce: {
                    input: { $ifNull: ["$terjual.track", []] },
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.soldAtMoment"] },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $project: { alamatToko: 0 },
        },
        {
          $project: { userData: 0 },
        },
      ]);

      const productNotFlashSale = products.filter((prod) => !prod.isFlashSale);
      const productFlashSale = products.filter((prod) => prod.isFlashSale);

      return res.status(200).json({ productFlashSale, productNotFlashSale });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  list_product_adminPanel: async (req, res, next) => {
    try {
      const data = await Product.find().populate({ path: "userId", select: "_id role" }).populate("id_main_category").populate("id_sub_category").populate("categoryId");
      const dataProds = [];
      for (const produk of data) {
        const namaVendor = await Vendor.findOne({ userId: produk.userId });
        if (namaVendor) {
          dataProds.push({
            ...produk.toObject(),
            nama: namaVendor?.nama || namaVendor?.namaBadanUsaha,
          });
        }
      }
      return res.status(200).json({ message: "get data succcess", data });

    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  list_product_adminPanelSupplier: async (req, res, next) => {
    try {
      const data = await Product.find().populate({ path: "userId", select: "_id role" }).populate("id_main_category").populate("id_sub_category").populate("categoryId");
      const dataProds = [];
      for (const produk of data) {
        const namaVendor = await Supplier.findOne({ userId: produk.userId });
        if (namaVendor) {
          dataProds.push({
            ...produk.toObject(),
            nama: namaVendor?.nama || namaVendor?.namaBadanUsaha,
          });
        }
      }

      return res.status(200).json({ message: "Menampilkan semua produk yang dimiliki user", dataProds });

    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  list_all: async (req, res, next) => {
    try {
      const { status } = req.query;
      const data = await Product.find({ userId: req.user.id }).populate({ path: "userId", select: "_id role" }).populate("id_main_category").populate("id_sub_category").populate("categoryId").lean();
      const dataProds = [];
      for (const produk of data) {
        let detailToko;
        switch(produk.userId.role){
          case "vendor": 
            detailToko = await TokoVendor.findOne({ userId: produk.userId._id });
            break;
          case "supplier": 
            detailToko = await TokoSupplier.findOne({ userId: produk.userId._id });
            break;
          default:
            detailToko = await TokoSupplier.findOne({ userId: produk.userId._id });
            break;
        }
        const terjual = await SalesReport.findOne({ productId: produk._id });
        const totalTerjual = terjual
          ? terjual.track.reduce((accumulator, current) => {
            return accumulator + current.soldAtMoment;
          }, 0)
          : 0;
        dataProds.push({
          ...produk,
          nama: detailToko?.namaToko,
          totalTerjual,
        });
      }
      let finalData;
      if(!status){
        finalData = dataProds;
      };
      if(status){
        finalData = dataProds.filter(prd => prd.status.value.toLowerCase() === status.toLowerCase())
      }
      if (data && data.length > 0) {
        return res.status(200).json({ message: "Menampilkan semua produk yang dimiliki user", data: finalData });
      } else {
        return res.status(404).json({ message: "User tidak memiliki produk", data: finalData });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  productDetail: async (req, res, next) => {
    try {
      const dataProduct = await Product.findById(req.params.id)
        .populate("categoryId")
        .populate({
          path: "userId",
          select: "role",
        })
        .populate("id_main_category")
        .populate("id_sub_category")
        .populate("pangan.panganId")
        .lean();
      let accepted;
      switch(req.user.role){
        case "konsumen":
          accepted = "vendor";
          break;
        case "vendor":
          accepted = "supplier";
          break;
        case "supplier":
          accepted = 'produsen';
          break;
      }
      if (!dataProduct) return res.status(404).json({ message: `Product Id dengan ${req.params.id} tidak ditemukan` });
      if((accepted !== dataProduct.userId.role) && (dataProduct.userId._id.toString() !== req.user.id.toString()) ) return res.status(403).json({message: "Invalid Request"});
      const terjual = await SalesReport.findOne({ productId: req.params.id }).lean();
      const total_terjual = terjual
        ? terjual.track.reduce((acc, val) => {
          return acc + val.soldAtMoment;
        }, 0)
        : 0;
      let toko;
      const wishlisted = await Wishlist.exists({ productId: req.params.id, userId: req.user?.id })
      switch (dataProduct.userId.role) {
        case "vendor":
          toko = await TokoVendor.findOne({ userId: dataProduct.userId._id }).populate("address");
          break;
        case "supplier":
          toko = await TokoSupplier.findOne({ userId: dataProduct.userId._id }).populate("address");
          break;
        case "produsen":
          toko = await TokoProdusen.findOne({ userId: dataProduct.userId._id }).populate("address");
          break;
      }
      if (dataProduct.bervarian == true) {
        const { pangan, varian, ...restOfProduct } = dataProduct;
        const nutrisi = {
          takaran_saji: "0",
          energi: "0",
          protein: "0",
          lemak: "0",
          karbohidrat: "0",
          serat: "0",
          kalsium: "0",
          fosfor: "0",
          besi: "0",
          natrium: "0",
          kalium: "0",
          tembaga: "0",
          thiamin: "0",
          riboflavin: "0",
          vitamin_c: "0",
        };
        let nilai_varian = [];
        for (const item of varian) {
          if (item.nama_varian == "Topping") {
            nilai_varian = item.nilai_varian;
          }
          nilai_varian;
        }
        if (nilai_varian.length > 0) {
          let gizi_varian = [];

          for (const item of nilai_varian) {
            const gizi = await Pangan.findById(item.bahan).select(
              "air.value energi.value protein.value lemak.value kh.value serat.value kalsium.value fosfor.value besi.value natrium.value kalium.value tembaga.value thiamin.value riboflavin.value vitc.value"
            );
            if(!item.bahan) return res.status(400).json({message: "Produk anomali"})
            gizi_varian.push(gizi);
          }

          const gizi_nilai_varian = [];
          for (let i = 0; i < gizi_varian.length; i++) {
            const air = (nilai_varian[i].total_gram / 100) * gizi_varian[i].air.value;
            const energi = (nilai_varian[i].total_gram / 100) * gizi_varian[i].energi.value;
            const protein = (nilai_varian[i].total_gram / 100) * gizi_varian[i].protein.value;
            const lemak = (nilai_varian[i].total_gram / 100) * gizi_varian[i].lemak.value;
            const kh = (nilai_varian[i].total_gram / 100) * gizi_varian[i].lemak.value;
            const serat = (nilai_varian[i].total_gram / 100) * gizi_varian[i].serat.value;
            const kalsium = (nilai_varian[i].total_gram / 100) * gizi_varian[i].kalsium.value;
            const fosfor = (nilai_varian[i].total_gram / 100) * gizi_varian[i].fosfor.value;
            const besi = (nilai_varian[i].total_gram / 100) * gizi_varian[i].besi.value;
            const natrium = (nilai_varian[i].total_gram / 100) * gizi_varian[i].besi.value;
            const kalium = (nilai_varian[i].total_gram / 100) * gizi_varian[i].kalium.value;
            const tembaga = (nilai_varian[i].total_gram / 100) * gizi_varian[i].tembaga.value;
            const thiamin = (nilai_varian[i].total_gram / 100) * gizi_varian[i].thiamin.value;
            const riboflavin = (nilai_varian[i].total_gram / 100) * gizi_varian[i].riboflavin.value;
            const vitc = (nilai_varian[i].total_gram / 100) * gizi_varian[i].riboflavin.value;

            gizi_nilai_varian.push({
              air: air,
              energi: energi,
              protein: protein,
              lemak: lemak,
              kh: kh,
              serat: serat,
              kalsium: kalsium,
              fosfor: fosfor,
              besi: besi,
              natrium: natrium,
              kalium: kalium,
              tembaga: tembaga,
              thiamin: thiamin,
              riboflavin: riboflavin,
              vitc: vitc,
            });
          }
          const seluruh_gizi_varian = gizi_nilai_varian.reduce((accumulator, current) => {
            for (let key in current) {
              if (accumulator[key]) {
                accumulator[key] += current[key];
              } else {
                accumulator[key] = current[key];
              }
            }
            return accumulator;
          }, {});

          Object.keys(seluruh_gizi_varian).forEach((key) => (seluruh_gizi_varian[key] = formatNumber(seluruh_gizi_varian[key])));

          if (pangan?.length > 1) {
            const nilai_gizi_pangan = [];
            const totalBeratPangan = pangan.reduce((acc, val) => {
              return acc + parseFloat(val?.berat);
            }, 0);
            for (const item of pangan) {
              const air = (item.berat / totalBeratPangan) * parseFloat(item.panganId.air.value);
              const energi = (item.berat / totalBeratPangan) * parseFloat(item.panganId.energi.value);
              const protein = (item.berat / totalBeratPangan) * parseFloat(item.panganId.protein.value);
              const lemak = (item.berat / totalBeratPangan) * parseFloat(item.panganId.lemak.value);
              const kh = (item.berat / totalBeratPangan) * parseFloat(item.panganId.kh.value);
              const serat = (item.berat / totalBeratPangan) * parseFloat(item.panganId.serat.value);
              const kalsium = (item.berat / totalBeratPangan) * parseFloat(item.panganId.kalsium.value);
              const fosfor = (item.berat / totalBeratPangan) * parseFloat(item.panganId.fosfor.value);
              const besi = (item.berat / totalBeratPangan) * parseFloat(item.panganId.besi.value);
              const natrium = (item.berat / totalBeratPangan) * parseFloat(item.panganId.natrium.value);
              const kalium = (item.berat / totalBeratPangan) * parseFloat(item.panganId.kalium.value);
              const tembaga = (item.berat / totalBeratPangan) * parseFloat(item.panganId.tembaga.value);
              const thiamin = (item.berat / totalBeratPangan) * parseFloat(item.panganId.thiamin.value);
              const riboflavin = (item.berat / totalBeratPangan) * parseFloat(item.panganId.riboflavin.value);
              const vitc = (item.berat / totalBeratPangan) * parseFloat(item.panganId.vitc.value);
              nilai_gizi_pangan.push({
                air: formatNumber(air),
                energi: formatNumber(energi),
                protein: formatNumber(protein),
                lemak: formatNumber(lemak),
                kh: formatNumber(kh),
                serat: formatNumber(serat),
                kalsium: formatNumber(kalsium),
                fosfor: formatNumber(fosfor),
                besi: formatNumber(besi),
                natrium: formatNumber(natrium),
                kalium: formatNumber(kalium),
                tembaga: formatNumber(tembaga),
                thiamin: formatNumber(thiamin),
                riboflavin: formatNumber(riboflavin),
                vitc: formatNumber(vitc),
              });
            }
            const tambah_seluruh_gizi = nilai_gizi_pangan.reduce((accumulator, current) => {
              for (let key in current) {
                if (accumulator[key]) {
                  accumulator[key] += current[key];
                } else {
                  accumulator[key] = current[key];
                }
              }
              Object.keys(accumulator).map((key) => formatNumber(accumulator[key]));
              return accumulator;
            }, {});

            Object.keys(tambah_seluruh_gizi).forEach((key) => (tambah_seluruh_gizi[key] = formatNumber(tambah_seluruh_gizi[key])));

            nutrisi.energi = `${((parseFloat(tambah_seluruh_gizi?.energi) / 100) * totalBeratPangan + seluruh_gizi_varian?.energi).toFixed(1)} kkal`;
            nutrisi.protein = `${((parseFloat(tambah_seluruh_gizi?.protein) / 100) * totalBeratPangan + seluruh_gizi_varian?.protein).toFixed(1)} g`;
            nutrisi.lemak = `${((parseFloat(tambah_seluruh_gizi?.lemak) / 100) * totalBeratPangan + seluruh_gizi_varian?.lemak).toFixed(1)} g`;
            nutrisi.karbohidrat = `${((parseFloat(tambah_seluruh_gizi?.kh) / 100) * totalBeratPangan + seluruh_gizi_varian?.kh).toFixed(1)} g`;
            nutrisi.serat = `${((parseFloat(tambah_seluruh_gizi?.serat) / 100) * totalBeratPangan + seluruh_gizi_varian?.serat).toFixed(1)} mg`;
            nutrisi.kalsium = `${((parseFloat(tambah_seluruh_gizi?.kalsium) / 100) * totalBeratPangan + seluruh_gizi_varian?.kalsium).toFixed(1)} mg`;
            nutrisi.fosfor = `${((parseFloat(tambah_seluruh_gizi?.fosfor) / 100) * totalBeratPangan + seluruh_gizi_varian?.fosfor).toFixed(1)} mg`;
            nutrisi.besi = `${((parseFloat(tambah_seluruh_gizi?.besi) / 100) * totalBeratPangan + seluruh_gizi_varian?.besi).toFixed(1)} mg`;
            nutrisi.natrium = `${((parseFloat(tambah_seluruh_gizi?.natrium) / 100) * totalBeratPangan + seluruh_gizi_varian?.natrium).toFixed(1)} mg`;
            nutrisi.kalium = `${((parseFloat(tambah_seluruh_gizi?.kalium) / 100) * totalBeratPangan + seluruh_gizi_varian?.kalium).toFixed(1)} mg`;
            nutrisi.tembaga = `${((parseFloat(tambah_seluruh_gizi?.tembaga) / 100) * totalBeratPangan + seluruh_gizi_varian?.tembaga).toFixed(1)} mg`;
            nutrisi.thiamin = `${((parseFloat(tambah_seluruh_gizi?.thiamin) / 100) * totalBeratPangan + seluruh_gizi_varian?.thiamin).toFixed(1)} mg`;
            nutrisi.riboflavin = `${((parseFloat(tambah_seluruh_gizi?.riboflavin) / 100) * totalBeratPangan + seluruh_gizi_varian?.riboflavin).toFixed(1)} mg`;
            nutrisi.vitamin_c = `${((parseFloat(tambah_seluruh_gizi?.vitc) / 100) * totalBeratPangan + seluruh_gizi_varian?.vitc).toFixed(1)} mg`;
            nutrisi.takaran_saji = `${totalBeratPangan} g`;
          } else {
            pangan?.forEach((item) => {
              nutrisi.energi = `${((parseFloat(item?.panganId?.energi?.value) / 100) * item?.berat + seluruh_gizi_varian?.energi).toFixed(1)} kkal`;
              nutrisi.protein = `${((parseFloat(item?.panganId?.protein?.value) / 100) * item?.berat + seluruh_gizi_varian?.protein).toFixed(1)} g`;
              nutrisi.lemak = `${((parseFloat(item?.panganId?.lemak?.value) / 100) * item?.berat + seluruh_gizi_varian?.lemak).toFixed(1)} g`;
              nutrisi.karbohidrat = `${((parseFloat(item?.panganId?.kh?.value) / 100) * item?.berat + seluruh_gizi_varian?.kh).toFixed(1)} g`;
              nutrisi.serat = `${((parseFloat(item?.panganId?.serat?.value) / 100) * item?.berat + seluruh_gizi_varian?.serat).toFixed(1)} mg`;
              nutrisi.kalsium = `${((parseFloat(item?.panganId?.kalsium?.value) / 100) * item?.berat + seluruh_gizi_varian?.kalsium).toFixed(1)} mg`;
              nutrisi.fosfor = `${((parseFloat(item?.panganId?.fosfor?.value) / 100) * item?.berat + seluruh_gizi_varian?.fosfor).toFixed(1)} mg`;
              nutrisi.besi = `${((parseFloat(item?.panganId?.besi?.value) / 100) * item?.berat + seluruh_gizi_varian?.besi).toFixed(1)} mg`;
              nutrisi.natrium = `${((parseFloat(item?.panganId?.natrium?.value) / 100) * item?.berat + seluruh_gizi_varian?.natrium).toFixed(1)} mg`;
              nutrisi.kalium = `${((parseFloat(item?.panganId?.kalium?.value) / 100) * item?.berat + seluruh_gizi_varian?.kalium).toFixed(1)} mg`;
              nutrisi.tembaga = `${((parseFloat(item?.panganId?.tembaga?.value) / 100) * item?.berat + seluruh_gizi_varian?.tembaga).toFixed(1)} mg`;
              nutrisi.thiamin = `${((parseFloat(item?.panganId?.thiamin?.value) / 100) * item?.berat + seluruh_gizi_varian?.thiamin).toFixed(1)} mg`;
              nutrisi.riboflavin = `${((parseFloat(item?.panganId?.riboflavin?.value) / 100) * item?.berat + seluruh_gizi_varian?.riboflavin).toFixed(1)} mg`;
              nutrisi.vitamin_c = `${((parseFloat(item?.panganId?.vitc?.value) / 100) * item.berat + seluruh_gizi_varian?.vitc).toFixed(1)} mg`;
              nutrisi.takaran_saji = `${item.berat} g`;
            });
          }
          return res.status(200).json({
            datas: {
              ...restOfProduct,
              total_terjual: terjual ? total_terjual : 0,
              varian,
            },
            toko,
            seluruh_gizi_varian,
            nutrisi,
          });
        }
      }
      const { pangan, ...restOfProduct } = dataProduct;
      const nutrisi = {
        takaran_saji: "0",
        energi: "0",
        protein: "0",
        lemak: "0",
        karbohidrat: "0",
        serat: "0",
        kalsium: "0",
        fosfor: "0",
        besi: "0",
        natrium: "0",
        kalium: "0",
        tembaga: "0",
        thiamin: "0",
        riboflavin: "0",
        vitamin_c: "0",
      };
      if (pangan?.length > 1) {
        const nilai_gizi_pangan = [];
        const totalBeratPangan = pangan.reduce((acc, val) => {
          return acc + parseFloat(val?.berat);
        }, 0);
        for (const item of pangan) {
          const air = (item.berat / totalBeratPangan) * parseFloat(item.panganId.air.value);
          const energi = (item.berat / totalBeratPangan) * parseFloat(item.panganId.energi.value);
          const protein = (item.berat / totalBeratPangan) * parseFloat(item.panganId.protein.value);
          const lemak = (item.berat / totalBeratPangan) * parseFloat(item.panganId.lemak.value);
          const kh = (item.berat / totalBeratPangan) * parseFloat(item.panganId.kh.value);
          const serat = (item.berat / totalBeratPangan) * parseFloat(item.panganId.serat.value);
          const kalsium = (item.berat / totalBeratPangan) * parseFloat(item.panganId.kalsium.value);
          const fosfor = (item.berat / totalBeratPangan) * parseFloat(item.panganId.fosfor.value);
          const besi = (item.berat / totalBeratPangan) * parseFloat(item.panganId.besi.value);
          const natrium = (item.berat / totalBeratPangan) * parseFloat(item.panganId.natrium.value);
          const kalium = (item.berat / totalBeratPangan) * parseFloat(item.panganId.kalium.value);
          const tembaga = (item.berat / totalBeratPangan) * parseFloat(item.panganId.tembaga.value);
          const thiamin = (item.berat / totalBeratPangan) * parseFloat(item.panganId.thiamin.value);
          const riboflavin = (item.berat / totalBeratPangan) * parseFloat(item.panganId.riboflavin.value);
          const vitc = (item.berat / totalBeratPangan) * parseFloat(item.panganId.vitc.value);
          nilai_gizi_pangan.push({
            air: formatNumber(air),
            energi: formatNumber(energi),
            protein: formatNumber(protein),
            lemak: formatNumber(lemak),
            kh: formatNumber(kh),
            serat: formatNumber(serat),
            kalsium: formatNumber(kalsium),
            fosfor: formatNumber(fosfor),
            besi: formatNumber(besi),
            natrium: formatNumber(natrium),
            kalium: formatNumber(kalium),
            tembaga: formatNumber(tembaga),
            thiamin: formatNumber(thiamin),
            riboflavin: formatNumber(riboflavin),
            vitc: formatNumber(vitc),
          });
        }
        const tambah_seluruh_gizi = nilai_gizi_pangan.reduce((accumulator, current) => {
          for (let key in current) {
            if (accumulator[key]) {
              accumulator[key] += current[key];
            } else {
              accumulator[key] = current[key];
            }
          }
          Object.keys(accumulator).map((key) => formatNumber(accumulator[key]));
          return accumulator;
        }, {});

        Object.keys(tambah_seluruh_gizi).forEach((key) => (tambah_seluruh_gizi[key] = formatNumber(tambah_seluruh_gizi[key])));

        nutrisi.energi = `${((parseFloat(tambah_seluruh_gizi?.energi) / 100) * totalBeratPangan).toFixed(1)} kkal`;
        nutrisi.protein = `${((parseFloat(tambah_seluruh_gizi?.protein) / 100) * totalBeratPangan).toFixed(1)} g`;
        nutrisi.lemak = `${((parseFloat(tambah_seluruh_gizi?.lemak) / 100) * totalBeratPangan).toFixed(1)} g`;
        nutrisi.karbohidrat = `${((parseFloat(tambah_seluruh_gizi?.kh) / 100) * totalBeratPangan).toFixed(1)} g`;
        nutrisi.serat = `${((parseFloat(tambah_seluruh_gizi?.serat) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.kalsium = `${((parseFloat(tambah_seluruh_gizi?.kalsium) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.fosfor = `${((parseFloat(tambah_seluruh_gizi?.fosfor) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.besi = `${((parseFloat(tambah_seluruh_gizi?.besi) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.natrium = `${((parseFloat(tambah_seluruh_gizi?.natrium) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.kalium = `${((parseFloat(tambah_seluruh_gizi?.kalium) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.tembaga = `${((parseFloat(tambah_seluruh_gizi?.tembaga) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.thiamin = `${((parseFloat(tambah_seluruh_gizi?.thiamin) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.riboflavin = `${((parseFloat(tambah_seluruh_gizi?.riboflavin) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.vitamin_c = `${((parseFloat(tambah_seluruh_gizi?.vitc) / 100) * totalBeratPangan).toFixed(1)} mg`;
        nutrisi.takaran_saji = `${totalBeratPangan} g`;
      } else {
        pangan?.forEach((item) => {
          nutrisi.energi = `${((parseFloat(item?.panganId?.energi?.value) / 100) * item?.berat).toFixed(1)} kkal`;
          nutrisi.protein = `${((parseFloat(item?.panganId?.protein?.value) / 100) * item?.berat).toFixed(1)} g`;
          nutrisi.lemak = `${((parseFloat(item?.panganId?.lemak?.value) / 100) * item?.berat).toFixed(1)} g`;
          nutrisi.karbohidrat = `${((parseFloat(item?.panganId?.kh?.value) / 100) * item?.berat).toFixed(1)} g`;
          nutrisi.serat = `${((parseFloat(item?.panganId?.serat?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.kalsium = `${((parseFloat(item?.panganId?.kalsium?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.fosfor = `${((parseFloat(item?.panganId?.fosfor?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.besi = `${((parseFloat(item?.panganId?.besi?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.natrium = `${((parseFloat(item?.panganId?.natrium?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.kalium = `${((parseFloat(item?.panganId?.kalium?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.tembaga = `${((parseFloat(item?.panganId?.tembaga?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.thiamin = `${((parseFloat(item?.panganId?.thiamin?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.riboflavin = `${((parseFloat(item?.panganId?.riboflavin?.value) / 100) * item?.berat).toFixed(1)} mg`;
          nutrisi.vitamin_c = `${((parseFloat(item?.panganId?.vitc?.value) / 100) * item.berat).toFixed(1)} mg`;
          nutrisi.takaran_saji = `${item.berat} g`;
        });
      }
      if (!dataProduct) return res.status(404).json({ message: "product Not Found" });
      return res.status(200).json({
        datas: {
          ...restOfProduct,
          total_terjual: terjual ? total_terjual : 0,
        },
        toko,
        wishlisted: wishlisted ? true : false,
        nutrisi,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  upload: async (req, res, next) => {
    // a = x
    // b = y
    // y = b * x / a
    try {
      console.log(req.body);
      if (req.user.role === "konsumen") return res.status(403).json({ message: "User dengan role konsumen tidak bisa menambah product" });
      //JANGAN DULU DIHAPUS!!
      // if (req.user.role === "produsen" && !req.body.bahanBaku && (!Array.isArray(req.body.bahanBaku))) {
      //   return res.status(400).json({
      //     message: "Produsen jika ingin menambah produk harus menyertakan bahanBaku dalam bentuk array of object dengan property bahanBakuId dan quantityNeed"
      //   });
      // };

      // if (req.body.bahanBaku && req.user.role === "produsen") {
      //   const obj = []
      //   for (const bahan of req.body.bahanBaku) {
      //     obj.push(JSON.parse(bahan))
      //   };
      //   req.body.bahanBaku = obj;

      //   for (const bahan of req.body.bahanBaku) {
      //     const bahanFound = await BahanBaku.findById(bahan.bahanBakuId)
      //     if (!bahanFound) return res.status(404).json({ message: "Bahan baku tidak ditemukan" })
      //   }
      // };

      // if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Produk harus memiliki foto. Minimal Satu" });
      const category = await SpecificCategory.findById(req.body.categoryId);
      if (!category) return res.status(400).json({ message: `Category dengan id: ${req.body.categoryId} tidak ada` });
      const subCategory = await SubCategory.findOne({ contents: { $in: req.body.categoryId } });
      const mainCategory = await MainCategory.findOne({ contents: { $in: subCategory._id } });

      const imgPaths = [];

      if (req.files.ImageProduct && req.files.ImageProduct.length !== 0) {
        if (Array.isArray(req.files.ImageProduct) && req.files.ImageProduct.length > 0) {
          for (const img of req.files.ImageProduct) {
            const nameImg = `${req.body.name_product.replace(/ /g, "_")}_${new Date().getTime()}${path.extname(img.name)}`;
            const pathImg = path.join(__dirname, "../public", "img_products", nameImg);
            imgPaths.push(`${process.env.HOST}public/img_products/${nameImg}`);
            img.mv(pathImg, (err) => {
              if (err) return res.status(500).json({ message: "Ada kesalahan saat nyimpan file, segera diperbaiki!" });
            });
          }
        } else {
          const nameImg = `${req.body.name_product.replace(/ /g, "_")}_${new Date().getTime()}${path.extname(req.files.ImageProduct.name)}`;
          const pathImg = path.join(__dirname, "../public", "img_products", nameImg);
          req.files.ImageProduct.mv(pathImg, (err) => {
            if (err) return res.status(500).json({ message: "Ada kesalahan saat nyimpan file, segera diperbaiki!" });
          });
          imgPaths.push(`${process.env.HOST}public/img_products/${nameImg}`);
        }
      }

      let newProduct;

      if (req.user.role === "vendor") {
        const dataToko = await TokoVendor.findOne({ userId: req.user.id }).populate("address");
        const province = dataToko.address.province;

        let newPangan;

        const pangan = [];

        if (req.body.bervarian === "false" || !req.body.bervarian) {
          const dataProduct = req.body;
          dataProduct.image_product = imgPaths;
          dataProduct.userId = req.user.id;
          JSON.parse(req.body.pangan).forEach((item) => {
            pangan.push(item);
          });

          if (pangan.length === 1) {
            newProduct = await Product.create({
              ...dataProduct,
              isPublished: true,
              pangan,
              id_sub_category: subCategory._id,
              id_main_category: mainCategory._id,
            });
            return res.status(201).json({
              error: false,
              message: "Upload Product Success",
              newProduct,
            });
          } else {
            const totalBeratPangan = pangan.reduce((acc, val) => {
              return acc + parseFloat(val?.berat);
            }, 0);

            const maxBeratPangan = pangan.reduce(
              (max, current) => {
                return current.berat > max.berat ? current : max;
              },
              { berat: -Infinity }
            );

            const pangan_terbanyak = await Pangan.findById(maxBeratPangan.panganId);

            const Kelompok_pangan = pangan_terbanyak.kelompok_pangan;
            const kode_bahan = pangan_terbanyak.kode_bahan.substring(0, 1);

            const kodeRegex = new RegExp(`${kode_bahan}P`);

            const pangan_terakhir = await Pangan.findOne({ kode_bahan: kodeRegex }).sort({ kode_bahan: -1 });

            const kode_bahan_terbaru = `${kode_bahan}P` + `${parseInt(pangan_terakhir.kode_bahan.substring(2, 5)) + 1}`;

            const nama_bahan = [];

            for (const item of pangan) {
              const bahan = await Pangan.findById(item.panganId).select(
                "air.value energi.value protein.value lemak.value kh.value serat.value kalsium.value fosfor.value besi.value natrium.value kalium.value tembaga.value thiamin.value riboflavin.value vitc.value"
              );
              nama_bahan.push(bahan);
            }
            const nilai_gizi_pangan = [];

            for (let i = 0; i < pangan.length; i++) {
              const air = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].air.value);
              const energi = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].energi.value);
              const protein = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].protein.value);
              const lemak = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].lemak.value);
              const kh = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].kh.value);
              const serat = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].serat.value);
              const kalsium = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].kalsium.value);
              const fosfor = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].fosfor.value);
              const besi = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].besi.value);
              const natrium = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].natrium.value);
              const kalium = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].kalium.value);
              const tembaga = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].tembaga.value);
              const thiamin = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].thiamin.value);
              const riboflavin = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].riboflavin.value);
              const vitc = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].vitc.value);
              nilai_gizi_pangan.push({
                air: formatNumber(air),
                energi: formatNumber(energi),
                protein: formatNumber(protein),
                lemak: formatNumber(lemak),
                kh: formatNumber(kh),
                serat: formatNumber(serat),
                kalsium: formatNumber(kalsium),
                fosfor: formatNumber(fosfor),
                besi: formatNumber(besi),
                natrium: formatNumber(natrium),
                kalium: formatNumber(kalium),
                tembaga: formatNumber(tembaga),
                thiamin: formatNumber(thiamin),
                riboflavin: formatNumber(riboflavin),
                vitc: formatNumber(vitc),
              });
            }

            const tambah_seluruh_gizi = nilai_gizi_pangan.reduce((accumulator, current) => {
              for (let key in current) {
                if (accumulator[key]) {
                  accumulator[key] += current[key];
                } else {
                  accumulator[key] = current[key];
                }
              }
              Object.keys(accumulator).map((key) => formatNumber(accumulator[key]));
              return accumulator;
            }, {});

            Object.keys(tambah_seluruh_gizi).forEach((key) => (tambah_seluruh_gizi[key] = formatNumber(tambah_seluruh_gizi[key])));

            newProduct = await Product.create({
              ...dataProduct,
              isPublished: true,
              pangan,
              id_sub_category: subCategory._id,
              id_main_category: mainCategory._id,
            });

            newPangan = await Pangan.create({
              kode_bahan: kode_bahan_terbaru,
              nama_bahan: req.body.name_product,
              kelompok_pangan: Kelompok_pangan,
              jenis_pangan: "makanan olahan",
              nama_makanan_lokal: req.body.nama_product,
              mayoritas_daerah_lokal: province,
              keterangan: req.body.long_description,
              jenis_makanan: "makanan utama",
              nama_makanan_lokal: req.body.name_product,
              image_pangan: imgPaths[0],
              air: {
                value: tambah_seluruh_gizi.air,
              },
              energi: {
                value: tambah_seluruh_gizi.energi,
              },
              protein: {
                value: tambah_seluruh_gizi.protein,
              },
              lemak: {
                value: tambah_seluruh_gizi.lemak,
              },
              kh: {
                value: tambah_seluruh_gizi.kh,
              },
              serat: {
                value: tambah_seluruh_gizi.serat,
              },
              kalsium: {
                value: tambah_seluruh_gizi.kalsium,
              },
              fosfor: {
                value: tambah_seluruh_gizi.fosfor,
              },
              besi: {
                value: tambah_seluruh_gizi.besi,
              },
              natrium: {
                value: tambah_seluruh_gizi.natrium,
              },
              kalium: {
                value: tambah_seluruh_gizi.kalium,
              },
              tembaga: {
                value: tambah_seluruh_gizi.tembaga,
              },
              thiamin: {
                value: tambah_seluruh_gizi.thiamin,
              },
              riboflavin: {
                value: tambah_seluruh_gizi.riboflavin,
              },
              vitc: {
                value: tambah_seluruh_gizi.vitc,
              },
            });
            return res.status(201).json({
              error: false,
              message: "Upload Product Success",
              datas: newProduct,
              pangan: newPangan,
            });
          }
        } else {
          if (!req.body.varian) return res.status(400).json({ message: "Kurang Body Request *varian*" });
          const varian = [];
          JSON.parse(req.body.varian).forEach((element) => {
            varian.push(element);
          });
          JSON.parse(req.body.pangan).forEach((item) => {
            pangan.push(item);
          });

          const totalBeratPangan = pangan.reduce((acc, val) => {
            return acc + parseFloat(val?.berat);
          }, 0);

          if (pangan.length === 1) {
            delete req.body.varian;
            delete req.body.pangan;
            const dataProduct = {
              ...req.body,
              varian,
              pangan,
              id_main_category: mainCategory._id,
              id_sub_category: subCategory._id,
              userId: req.user.id,
              image_product: imgPaths,
            };
            newProduct = await Product.create(dataProduct);
            return res.status(201).json({
              error: false,
              message: "Upload Product Success",
              newProduct,
            });
          } else {
            const maxBeratPangan = pangan.reduce(
              (max, current) => {
                return current.berat > max.berat ? current : max;
              },
              { berat: -Infinity }
            );

            const pangan_terbanyak = await Pangan.findById(maxBeratPangan.panganId);

            const kelompok_pangan = pangan_terbanyak.kelompok_pangan;
            const kode_bahan = pangan_terbanyak.kode_bahan.substring(0, 1);

            const kodeRegex = new RegExp(`${kode_bahan}P`);

            const pangan_terakhir = await Pangan.findOne({ kode_bahan: kodeRegex }).sort({ kode_bahan: -1 });

            const kode_bahan_terbaru = `${kode_bahan}P` + `${parseInt(pangan_terakhir.kode_bahan.substring(2, 5)) + 1}`;

            const nama_bahan = [];

            for (const item of pangan) {
              const bahan = await Pangan.findById(item.panganId).select(
                "air.value energi.value protein.value lemak.value kh.value serat.value kalsium.value fosfor.value besi.value natrium.value kalium.value tembaga.value thiamin.value riboflavin.value vitc.value"
              );
              nama_bahan.push(bahan);
            }
            const nilai_gizi_pangan = [];

            for (let i = 0; i < pangan.length || i < nama_bahan.length; i++) {
              const air = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].air.value);
              const energi = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].energi.value);
              const protein = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].protein.value);
              const lemak = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].lemak.value);
              const kh = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].kh.value);
              const serat = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].serat.value);
              const kalsium = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].kalsium.value);
              const fosfor = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].fosfor.value);
              const besi = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].besi.value);
              const natrium = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].natrium.value);
              const kalium = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].kalium.value);
              const tembaga = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].tembaga.value);
              const thiamin = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].thiamin.value);
              const riboflavin = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].riboflavin.value);
              const vitc = (pangan[i].berat / totalBeratPangan) * parseFloat(nama_bahan[i].vitc.value);
              nilai_gizi_pangan.push({
                air: formatNumber(air),
                energi: formatNumber(energi),
                protein: formatNumber(protein),
                lemak: formatNumber(lemak),
                kh: formatNumber(kh),
                serat: formatNumber(serat),
                kalsium: formatNumber(kalsium),
                fosfor: formatNumber(fosfor),
                besi: formatNumber(besi),
                natrium: formatNumber(natrium),
                kalium: formatNumber(kalium),
                tembaga: formatNumber(tembaga),
                thiamin: formatNumber(thiamin),
                riboflavin: formatNumber(riboflavin),
                vitc: formatNumber(vitc),
              });
            }

            const tambah_seluruh_gizi = nilai_gizi_pangan.reduce((accumulator, current) => {
              for (let key in current) {
                if (accumulator[key]) {
                  accumulator[key] += current[key];
                } else {
                  accumulator[key] = current[key];
                }
              }
              Object.keys(accumulator).map((key) => formatNumber(accumulator[key]));
              return accumulator;
            }, {});

            Object.keys(tambah_seluruh_gizi).forEach((key) => (tambah_seluruh_gizi[key] = formatNumber(tambah_seluruh_gizi[key])));

            delete req.body.varian;
            delete req.body.pangan;
            const dataProduct = {
              ...req.body,
              varian,
              pangan,
              id_main_category: mainCategory._id,
              id_sub_category: subCategory._id,
              userId: req.user.id,
              image_product: imgPaths,
            };
            newProduct = await Product.create(dataProduct);
            newPangan = await Pangan.create({
              kode_bahan: kode_bahan_terbaru,
              nama_bahan: req.body.name_product,
              kelompok_pangan: kelompok_pangan,
              jenis_pangan: "makanan olahan",
              jenis_makanan: "makanan utama",
              nama_makanan_lokal: req.body.nama_product,
              mayoritas_daerah_lokal: province,
              keterangan: req.body.long_description,
              nama_makanan_lokal: req.body.name_product,
              image_pangan: imgPaths[0],
              air: {
                value: tambah_seluruh_gizi.air,
              },
              energi: {
                value: tambah_seluruh_gizi.energi,
              },
              protein: {
                value: tambah_seluruh_gizi.protein,
              },
              lemak: {
                value: tambah_seluruh_gizi.lemak,
              },
              kh: {
                value: tambah_seluruh_gizi.kh,
              },
              serat: {
                value: tambah_seluruh_gizi.serat,
              },
              kalsium: {
                value: tambah_seluruh_gizi.kalsium,
              },
              fosfor: {
                value: tambah_seluruh_gizi.fosfor,
              },
              besi: {
                value: tambah_seluruh_gizi.besi,
              },
              natrium: {
                value: tambah_seluruh_gizi.natrium,
              },
              kalium: {
                value: tambah_seluruh_gizi.kalium,
              },
              tembaga: {
                value: tambah_seluruh_gizi.tembaga,
              },
              thiamin: {
                value: tambah_seluruh_gizi.thiamin,
              },
              riboflavin: {
                value: tambah_seluruh_gizi.riboflavin,
              },
              vitc: {
                value: tambah_seluruh_gizi.vitc,
              },
            });
          }
        }
        return res.status(201).json({
          error: false,
          message: "Upload Product Success",
          datas: newProduct,
          pangan: newPangan,
        });
      } else {
        const dataProduct = req.body;
        dataProduct.image_product = imgPaths;
        dataProduct.userId = req.user.id;

        newProduct = await Product.create({
          ...dataProduct,
          isPublished: true,
          id_sub_category: subCategory._id,
          id_main_category: mainCategory._id,
        });
        return res.status(201).json({
          error: false,
          message: "Upload Product Success",
          datas: newProduct,
        });
      }
    } catch (err) {
      if (err.name == "ValidationError") {
        return res.status(400).json({ error: true, message: err.message });
      }
      console.log(err);
      next(err);
    }
  },

  pemasok: async (req, res, next) => {
    try {
      const { product_id, pemasok } = req.body;
      const produk = await Product.findByIdAndUpdate(product_id, { pemasok });
      if (!produk) {
        return res.status(404).json({ message: `Produk dengan id: ${product_id} tidak ditemukan` });
      }
      if (produk.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa mengubah produk orang lain!" });
      return res.status(200).json({
        message: "Berhasil mengubah pemasok untuk produk ini produk ini",
        data: produk,
      });
    } catch (err) {
      console.log(err);
      next(err);
      next(err);
    }
  },

  checkReviewedProduct: async (req, res, next) => {
    try {
      const { productId } = req.query;

      const product = await Product.findOne({ _id: productId, userId: req.user.id });

      if (product.isReviewed) return res.status(403).json({ message: "Product sedang direview, tidak bisa diubah" });

      return res.status(200).json({ message: "Product bisa diedit" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  editReviewed: async (req, res, next) => {
    try {
      if (req.user.role !== "administrator") return res.status(403).json({ message: "Hanya administrator yang diizinkan" });
      const product = await Product.findByIdAndUpdate(
        req.body.productId,
        {
          isReviewed: req.body.review,
        },
        { new: true }
      );
      console.log(req.body);
      return res.status(200).json({ message: "Berhasil mengubah reviewd status product", data: product });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  edit: async (req, res, next) => {
    try {
      let updateData;
      const productId = req.body.productId;
      const notDirectlyEdited = ["name_product", "id_main_category", "id_sub_category", "categoryId", "image_product", "description", "long_description", "varian"];

      if (!productId) return res.status(400).json({ message: "Diperlukan payload productId" });

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          error: true,
          message: `Produk dengan id: ${productId} tidak ditemukan`,
          datas: product,
        });
      }

      if (product.isReviewed) return res.status(403).json({ message: "Product sedang direview, tidak bisa diubah" });

      Object.keys(req.body).forEach((key) => {
        if (notDirectlyEdited.includes(key)) {
          return (updateData = {
            ...req.body,
            "status.value": "ditinjau",
            "status.message": "Produk kamu sedang dalam proses tinjauan superapp. Produk kamu akan segera terunggah setelah tinjauan selesai.",
          });
        } else {
          updateData = req.body;
        }
      });

      if (product.userId.toString() !== req.user.id && req.user.role !== "administrator") return res.status(403).json({ message: "Tidak bisa mengubah produk orang lain!" });
      console.log(updateData);
      const editedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
      return res.status(201).json({
        error: false,
        message: "Berhasil Mengubah Data Produk",
        datas: editedProduct,
      });
    } catch (err) {
      if (err && err.name == "ValidationError") {
        return res.status(400).json({
          error: true,
          message: err.message,
          fields: err.fields,
        });
      }
      console.log(err);
      next(err);
    }
  },

  addComment: async (req, res, next) => {
    try {
      const { product_id, komentar } = req.body;

      komentar.userId = req.user.id;

      if (!product_id) return res.status(400).json({ message: "Diperlukan payload product_id dan komentar" });

      const produk = await Product.findById(product_id);
      if (!produk) return res.status(404).json({ message: `Produk dengan id: ${product_id} tidak ditemukan` });

      const sameUser = produk.komentar.find((komen) => {
        console.log(komen.userId.toString(), req.user.id);
        return komen.userId.toString() == req.user.id;
      });

      if (sameUser) return res.status(403).json({ message: "User yang sama tidak bisa memberikan komentar dan rating lebih dari satu kali" });

      produk.komentar.push(komentar);
      await produk.save();
      return res.status(200).json({ message: "Berhasil menambahkan komentar untuk produk ini", data: produk });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  pemasok: async (req, res, next) => {
    try {
      const { product_id, pemasok } = req.body;
      const produk = await Product.findByIdAndUpdate(product_id, { $set: { pemasok } });

      if (!produk) return res.status(404).json({ message: `Produk dengan id: ${product_id} tidak ditemukan` });

      if (produk.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa mengubah produk orang lain!" });
      console.log(produk);
      return res.status(200).json({ message: "Berhasil mengubah pemasok untuk produk ini produk ini", data: produk });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  arsipkanProduct: async (req, res, next) => {
    try {
      const { productId, status } = req.body;
      const product = await Product.findOne({ _id: productId, userId: req.user.id });
      if (!product) return res.status(404).json({ message: `Tidak ditemukan product dengan id: ${productId}` });
      const ordered = await Pesanan.find({
        items: {
          $elemMatch: {
            product: {
              $elemMatch: {
                productId: productId,
              },
            },
          },
        },
        status: { $in: ["Belum Bayar", "Berlangsung"] },
      });

      const doneShipments = await Pengiriman.find({
        orderId: ordered._id,
        productToDelivers: {
          $elemMatch: {
            productId: productId,
          },
        },
        isBuyerAccepted: true,
      });

      if (status === "diarsipkan") {
        if (product.status.value === "diarsipkan") return res.status(400).json({ message: "Product sudah diarsipkan" });
        if (ordered.length > 0 && doneShipments.length === 0) return res.status(403).json({ message: "Tidak bisa mengarsipkan product karena ada orderan yang sedang aktif", data: ordered });
      }

      await Product.updateOne({ _id: productId }, { "status.value": status });
      return res.status(200).json({ message: `Berhasil ${status} product` });
    } catch (error) {
      console.log(error);
    }
  },

  updateProductPerformance: async (req, res, next) => {
    try {
      if (!req.body.productId) return res.status(400).json({ message: "Dibutuh kan payload productId" });
      const prod = await Product.findOne({_id: req.body.productId});
      if(!prod) return res.status(404).json({message: "Produk dengan id: " + req.body.productId + " tidak ditemukan"})
      const kinerja = await Performance.findOne({ productId: req.body.productId, userId: req.user.id });
      if(!kinerja){
        Performance.create({ productId: req.body.productId, userId: req.user.id })
        .then(()=>console.log("berhasil simpan performance produk"))
        .catch((e)=>console.log("gagal simpan performance produk ", e))
      }

      return res.status(200).json({ message: "Berhasil update performance product!" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const productId = req.params.productId;
      const deleted = await Product.findById(productId);
      if (!deleted) return res.status(404).json({ message: `Tidak ada produk dengan id: ${productId}` });
      if (req.user.id.toString() !== deleted.userId.toString() && req.user.role !== "administrator") return res.status(403).json({ message: "Anda Tidak Bisa Menghapus Produk Ini" });

      const ordered = await Pengiriman.find({
        productToDelivers: {
          $elemMatch: {
            productId: productId,
          },
        },
        isBuyerAccepted: false,
      }).lean();

      if (ordered.length > 0) return res.status(403).json({ message: `${deleted.name_product} tidak bisa dihapus sedang ada transaksi`, data: ordered });
      if (deleted.isReviewed && req.user.role !== "administrator") return res.status(403).json({ message: "Product sedang direview, tidak bisa hapus" });
      await Product.deleteOne({ _id: deleted._id });
      return res.status(201).json({
        error: false,
        message: "Berhasil Menghapus Data Produk",
        data: deleted,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
