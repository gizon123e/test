const Product = require("../models/model-product");
const User = require("../models/model-auth-user");
const Supplier = require("../models/supplier/model-supplier");
const mongoose = require('mongoose')
const Produsen = require("../models/produsen/model-produsen")
const SpecificCategory = require("../models/model-specific-category");
const MainCategory = require("../models/model-main-category")
const Performance = require('../models/model-laporan-kinerja-product');
const BahanBaku = require("../models/model-bahan-baku");
const SalesReport = require("../models/model-laporan-penjualan");
const Vendor = require("../models/vendor/model-vendor")
const path = require('path');
const jwt = require('../utils/jwt');
const { getToken } = require('../utils/getToken');

module.exports = {
  getProductWithMain: async(req, res, next) =>{
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const userRole = req.user.role
      const dataProds = await Product.aggregate([
        {
            $match:{
                id_main_category: id
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
            }
        },
        {
            $unwind: "$userData"
        }
      ]);

      let userVendor = [];
      let userSupplier = [];
      let userProdusens = [];
      let flashSaleProducts = [];
      let ordinaryProducts = [];

      dataProds.forEach(item => {

          if(item.userData.role === "vendor"){
              userVendor.push(item.userId)
          }else if(item.userData.role === 'supplier'){
              userSupplier.push(item.userId)
          }else if(item.userData.role === "produsen"){
              userProdusens.push(item.userId)
          }
          
          if(item.isFlashSale){
              flashSaleProducts.push({...item, produkFrom: item.userData.role});
          }else{
              ordinaryProducts.push({...item, produkFrom: item.userData.role});
          };
      });

      const dataVendors = await Vendor.aggregate([
        {
            $match: {
              userId: { $in: userVendor }
            }
        },
        {
            $lookup: {
                from: 'addresses',
                localField: 'address',
                foreignField: '_id',
                as: 'alamat'
            }
        },
        {
          $unwind: {
            path: '$alamat',
            preserveNullAndEmptyArrays: true
          }
        }
      ]);

      const dataSuppliers = await Supplier.aggregate([
          {
            $match:{
              userId: { $in: userSupplier }
            }
          },
          {
            $lookup: {
                from: 'addresses',
                localField: 'address',
                foreignField: '_id',
                as: 'alamat'
            }
          },
          {
            $unwind: {
              path: '$alamat',
              preserveNullAndEmptyArrays: true
            }
          }
      ]);

      const dataProdusens = await Produsen.aggregate([
          {
              $match:{
                userId: { $in: userProdusens }
              }
          },
          {
            $lookup: {
                from: 'addresses',
                localField: 'address',
                foreignField: '_id',
                as: 'alamat'
            }
          },
          {
            $unwind: {
              path: '$alamat',
              preserveNullAndEmptyArrays: true
            }
          }
      ]);

      flashSaleProducts.map(produk => {
          if(produk.produkFrom === "vendor"){
              const dataVendor = dataVendors.filter(vnd => {
                  return vnd.userId.equals(produk.userId)
              });
              produk.dataVendor = dataVendor
          }else if(produk.produkFrom === "supplier"){
              const dataSupplier = dataSuppliers.filter(vnd => {
                  return vnd.userId.equals(produk.userId)
              });
              produk.dataSupplier = dataSupplier
          }else if(produk.produkFrom === "produsen"){
              const dataProduen = dataProdusens.filter(vnd => {
                  return vnd.userId.equals(produk.userId)
              });
              produk.dataProduen = dataProduen
          }
      });

      ordinaryProducts.map(produk => {
          if(produk.produkFrom === "vendor"){
              const dataVendor = dataVendors.filter(vnd => {
                  return vnd.userId.equals(produk.userId)
              });
              produk.dataVendor = dataVendor
          }else if(produk.produkFrom === "supplier"){
              const dataSupplier = dataSuppliers.filter(vnd => {
                  return vnd.userId.equals(produk.userId)
              });
              produk.dataSupplier = dataSupplier
          }else if(produk.produkFrom === "produsen"){
              const dataProduen = dataProdusens.filter(vnd => {
                  return vnd.userId.equals(produk.userId)
              });
              produk.dataProduen = dataProduen
          }
      })
      let finalDataFlashSale;
      let finalDataNotFlashSale;

      switch(userRole){
          case("konsumen"):
              finalDataFlashSale =flashSaleProducts.filter(item => {
                  return item.produkFrom === "vendor"
              });
              finalDataNotFlashSale = ordinaryProducts.filter(item => {
                  return item.produkFrom === "vendor"
              })
              break;
          case("vendor"):
              finalDataFlashSale =flashSaleProducts.filter(item => {
                  return item.produkFrom === "supplier"
              });
              finalDataNotFlashSale = ordinaryProducts.filter(item => {
                  return item.produkFrom === "supplier"
              })
              break;
          case("supplier"):
              finalDataFlashSale = flashSaleProducts.filter(item => {
                  return item.produkFrom === "produsen"
              });
              finalDataNotFlashSale = ordinaryProducts.filter(item => {
                  return item.produkFrom === "produsen"
              })
              break;
      }
      return res.status(200).json({
        message: "Berhasil Mendapatkan Data",
        finalDataFlashSale,
        finalDataNotFlashSale
      })
    } catch (error) {
      console.log(error);
      next(error)
    }
  },
  search: async (req, res, next) => {
    try {

      function auth() {
        const token = getToken(req)

        const verifyToken = jwt.verify(token);
        if (!verifyToken) return null
        return verifyToken
      };

      const { name, category } = req.query;
      let handlerFilter = {};

      if (name) {
        console.log(name)
        handlerFilter = {
          ...handlerFilter,
          name_product: { $regex: new RegExp(name, "i") },
        };
      };

      if (category) {
        const categoryResoul = await SpecificCategory.findOne({
          name: { $regex: category, $options: "i" },
        });

        if (!categoryResoul) return res.status(404).json({ message: `Tidak Ditemukan product dengan kategori ${category}` })
        handlerFilter = { ...handlerFilter, categoryId: categoryResoul._id };
      };

      const list_product = await Product.find(handlerFilter)
        .populate("userId", "-password")
        .populate("categoryId");

      req.user = auth();
      let datas = []
      if (!req.user) {
        datas = list_product.filter((data) => {
          return data.userId.role === "vendor";
        });
      } else {
        datas = list_product.filter((data) => {
          switch (req.user.role) {
            case "konsumen":
              return data.userId.role === "vendor";
            case "vendor":
              return data.userId.role === "supplier";
            case "supplier":
              return data.userId.role === "produsen";
          };
        });
      }

      if (!list_product || list_product.length === 0) return res.status(404).json({ message: `Product dengan nama ${search} serta dengan kategori ${category} tidak ditemukan` })
      if ((!datas || datas.length === 0) && (list_product || list_product.length > 0)) return res.status(403).json({ message: "Produk yang dicari tidak boleh untuk user " + req.user.role })

      return res.status(200).json({ datas });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  list_product_adminPanel: async (req, res, next) => {
    try {
      const data = await Product.find().populate({path:"userId", select: "_id role"}).populate("id_main_category").populate("id_sub_category").populate("categoryId")
      const dataProds = [];
      for(const produk of data){
        const namaVendor = await Vendor.findOne({userId: produk.userId});
        dataProds.push({
          ...produk.toObject(),
          nama: namaVendor?.nama || namaVendor?.namaBadanUsaha
        });
      };
      if (data && data.length > 0) {
        return res.status(200).json({ message: "Menampilkan semua produk yang dimiliki user", dataProds })
      } else {
        return res.status(404).json({ message: "User tidak memiliki produk", data })
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  // list_all: async (req, res, next) => {
  //   try {
  //     const data = await Product.find().populate({path:"userId", select: "_id role"}).populate("id_main_category").populate("id_sub_category").populate("categoryId")
  //     const dataProds = [];
  //     for(const produk of data){
  //       const namaVendor = await Vendor.findOne({userId: produk.userId});
  //       dataProds.push({
  //         ...produk.toObject(),
  //         nama: namaVendor?.nama || namaVendor?.namaBadanUsaha
  //       });
  //     };
  //     if (data && data.length > 0) {
  //       return res.status(200).json({ message: "Menampilkan semua produk yang dimiliki user", dataProds })
  //     } else {
  //       return res.status(404).json({ message: "User tidak memiliki produk", data })
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     next(error)
  //   }
  // },

  productDetail: async (req, res, next) => {
    try {
      const dataProduct = await Product.findOne({ _id: req.params.id }).populate('categoryId');
      
      if (!dataProduct) return res.status(404).json({ message: "product Not Found" });

      return res.status(200).json({ datas: dataProduct });

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  upload: async (req, res, next) => {
    try {
      if (!req.files || !req.files.ImageProduct) return res.status(400).json({ message: "Produk Minimal Punya 1 Foto, kirimkan file foto dengan nama ImageProduct" });

      if (req.user.role === "konsumen") return res.status(403).json({ message: "User dengan role konsumen tidak bisa menambah product" });

      if ((req.user.role === "vendor" || req.user.role === "supplier") && (req.body.bahanBaku !== undefined)) return res.status(400).json({ message: "Payload bahan baku hanya untuk user produsen" });

      if (req.user.role === "produsen" && !req.body.bahanBaku && (!Array.isArray(req.body.bahanBaku))) {
        return res.status(400).json({
          message: "Produsen jika ingin menambah produk harus menyertakan bahanBaku dalam bentuk array of object dengan property bahanBakuId dan quantityNeed"
        });
      };

      if (req.body.bahanBaku && req.user.role === "produsen") {
        const obj = []
        for (const bahan of req.body.bahanBaku) {
          obj.push(JSON.parse(bahan))
        };
        req.body.bahanBaku = obj;

        for (const bahan of req.body.bahanBaku) {
          const bahanFound = await BahanBaku.findById(bahan.bahanBakuId)
          if (!bahanFound) return res.status(404).json({ message: "Bahan baku tidak ditemukan" })
        }
      };


      const category = await SpecificCategory.findById(req.body.categoryId);
      if (!category) return res.status(400).json({ message: `Category dengan id: ${req.body.categoryId} tidak ada` });

      const dataProduct = req.body;
      const imgPaths = [];
      if (Array.isArray(req.files.ImageProduct) && req.files.ImageProduct.length > 0) {
        req.files.ImageProduct.forEach((img, i) => {
          const pathImg = `${global.__basedir}/public/images/produkUser${req.user.name}_${dataProduct.name_product}${i}${path.extname(img.name)}`;
          img.mv(pathImg, function (err) {
            if (err) return res.status(507).json({ message: "Ada masalah saat mencoba nyimpan file gambar", error: err });
            imgPaths.push(`http://${req.headers.host}/public/images/produkUser${req.user.name}_${dataProduct.name_product}${i}${path.extname(img.name)}`);
          });
        });
      } else {
        const pathImg = `${global.__basedir}/public/images/produkUser${req.user.name}_${dataProduct.name_product}${1}${path.extname(req.files.ImageProduct.name)}`;
        req.files.ImageProduct.mv(pathImg, function (err) {
          if (err) return res.status(507).json({ message: "Ada masalah saat mencoba nyimpan file gambar", error: err });
          imgPaths.push(`http://${req.headers.host}/public/images/produkUser${req.user.name}_${dataProduct.name_product}${1}${path.extname(req.files.ImageProduct.name)}`);
        })
      };

      dataProduct.image_product = imgPaths
      const user = await User.findById(req.user.id);
      console.log(req.user)
      dataProduct.userId = user._id;
      const newProduct = await Product.create(dataProduct);

      await Performance.create({
        productId: newProduct._id,
        impressions: [{ time: new Date(), amount: 0 }],
        views: [{ time: new Date(), amount: 0 }]
      });

      await SalesReport.create({
        productId: newProduct._id,
        track: [{ time: new Date(), soldAtMoment: 0 }]
      });

      return res.status(201).json({
        error: false,
        message: "Upload Product Success",
        datas: newProduct,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  pemasok: async (req, res, next) => {
    try {
      const { product_id, pemasok } = req.body;
      const produk = await Product.findByIdAndUpdate(product_id, { pemasok });
      if (!produk) {
        return res
          .status(404)
          .json({ message: `Produk dengan id: ${product_id} tidak ditemukan` });
      }
      if (produk.userId.toString() !== req.user.id)
        return res
          .status(403)
          .json({ message: "Tidak bisa mengubah produk orang lain!" });
      return res
        .status(200)
        .json({
          message: "Berhasil mengubah pemasok untuk produk ini produk ini",
          data: produk,
        });
    } catch (err) {
      console.log(err);
      next(err);
      next(err);
    }
  },

  edit: async (req, res, next) => {
    try {
      const updateData = req.body;
      const productId = req.body.product_id;
      if (!productId)
        return res
          .status(400)
          .json({ message: "Diperlukan payload product_id" });
      delete req.body.product_id;
      const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true }
      );
      if (!product) {
        return res.status(404).json({
          error: true,
          message: `Produk dengan id: ${productId} tidak ditemukan`,
          datas: product,
        });
      }
      // if (product.userId.toString() !== req.user.id)
      //   return res
      //     .status(403)
      //     .json({ message: "Tidak bisa mengubah produk orang lain!" });

      return res.status(201).json({
        error: false,
        message: "Berhasil Mengubah Data Produk",
        datas: product,
      });
    } catch (err) {
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

      if (sameUser) return res.status(403).json({ message: "User yang sama tidak bisa memberikan komentar dan rating lebih dari satu kali", });

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
      console.log(produk)
      return res.status(200).json({ message: "Berhasil mengubah pemasok untuk produk ini produk ini", data: produk, });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  updateProductPerformance: async (req, res, next) => {
    try {
      const { views, impressions } = req.query

      if (!views && !impressions) return res.status(400).json({ message: "Harus ada query views atau impressionss" })

      if (!req.body.productId) return res.status(400).json({ message: "Dibutuh kan payload productId" })

      const kinerja = await Performance.findOne({ productId: req.body.productId }).populate("productId")

      if (!kinerja) return res.status(404).json({ message: `Tidak ditemukan product dengan id: ${req.body.productId}` })

      if (views && parseInt(views) !== NaN) {
        for (perform of kinerja.views) {
          perform.time.getDate() == new Date().getDate() ? perform.amount += parseInt(views) : kinerja.views.push({ time: new Date(), amount: views })
        }
      }

      if (impressions && parseInt(impressions) !== NaN) {
        for (perform of kinerja.impressions) {
          perform.time.getDate() == new Date().getDate() ? perform.amount += parseInt(impressions) : kinerja.impressions.push({ time: new Date(), amount: impressions })
        }
      }

      await kinerja.save({ new: true })

      return res.status(200).json({ message: "Berhasil update performance product!", data: kinerja })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  delete: async (req, res, next) => {
    try {
      const productId = req.body.product_id;
      const deleted = await Product.findByIdAndDelete(productId);
      if (deleted) {
        return res.status(201).json({
          error: false,
          message: "Berhasil Menghapus Data Produk",
          datas: deleted,
        });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};