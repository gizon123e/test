const Product = require("../models/model-product");
const Supplier = require("../models/supplier/model-supplier");
const Produsen = require("../models/produsen/model-produsen")
const Vendor = require("../models/vendor/model-vendor")
const mongoose = require('mongoose')
const SpecificCategory = require("../models/model-specific-category");
const SubCategory = require("../models/model-sub-category");
const MainCategory = require("../models/model-main-category");
const Promo = require('../models/model-promo');
const Performance = require('../models/model-laporan-kinerja-product');
const path = require('path');
const jwt = require('../utils/jwt');
const { getToken } = require('../utils/getToken');
// const BahanBaku = require("../models/model-bahan-baku");
// const SalesReport = require("../models/model-laporan-penjualan");

module.exports = {

  getProductWithSpecific: async(req, res, next) => {
    try {
      const id = req.params.id
      if(!id) return res.status(400).json({message: "Tolong kirimkan id specific category"})
      const products = await Product.find({categoryId: id}).populate('categoryId').populate('id_main_category').populate("id_sub_category")
      return res.status(200).json({message: "Berhasil mendapatkan Products", data: products})
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  getProductWithSub: async(req, res, next) => {
    try {
      const id = req.params.id
      if(!id) return res.status(400).json({message: "Tolong kirimkan id sub category"});
      const products = await Product.find({id_sub_category: id}).populate('categoryId').populate('id_main_category').populate("id_sub_category");
      return res.status(200).json({message: "Berhasil mendapatkan Products", data: products});
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getAllProductWithMain: async(req, res, next) => {
    try {
      const datas = await Product.find({id_main_category: req.params.id})
        .select('name_product total_price userId rating image_product')
        .populate({
          path: 'id_main_category',
          select: "name"
        })
        .populate({
          path: 'id_sub_category',
          select: 'name contents',
          populate: {
            path: 'contents',
            select: 'name'
          }
        })
        .populate({
          path: 'categoryId',
          select: "name"
        })
        .populate({
          path: "userId",
          select: "_id role"
        })
        .lean()
      console.log(datas.length)
      for (const produk of datas){
        console.log(produk._id ,produk.userId)
        switch(produk.userId.role){
          case "vendor":
            produk.namaToko = await Vendor.findOne({userId: produk.userId._id}).select("nama namaBadanUsaha").populate({
              path: "address",
              select:"regency"
            });
            break
          case "supplier":
            produk.namaToko = await Supplier.findOne({userId: produk.userId._id}).select("nama namaBadanUsaha").populate({
              path: "address",
              select:"regency"
            });
            break
          case "produsen":
            produk.namaToko = await Produsen.findOne({userId: produk.userId._id}).select("nama namaBadanUsaha").populate({
              path: "address",
              select:"regency"
            });
            break
        }
      }
      
      return res.status(200).json({message: "Berhasil Mendapatkan semua data produk dengan main category", datas})
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

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
          $project: { description: 0, id_main_category: 0, id_sub_category: 0, categoryId: 0, pemasok: 0 }
        },
        {
          $lookup:{
            from: "users",
            let: { userId: "$userId"},
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"]} }},
              { $project: { _id: 1, role: 1 }}
            ],
            as: "userData"
          }
        },
        {
          $unwind: "$userData"
        },
        {
          $lookup: {
            from: "vendors",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
              { $project: { _id: 1, nama: 1, namaBadanUsaha: 1, address: 1 } }
            ],
            as: "vendorData"
          }
        },
        {
          $lookup: {
            from: "suppliers",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
              { $project: { _id: 1, nama: 1, namaBadanUsaha: 1, address: 1 } }
            ],
            as: "supplierData"
          }
        },
        {
          $lookup: {
            from: "produsens",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
              { $project: { _id: 1, nama: 1, namaBadanUsaha: 1, address: 1 } }
            ],
            as: "produsenDatas"
          }
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
                    else: { $arrayElemAt: ["$produsenDatas", 0] }
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            vendorData: 0,
            supplierData: 0,
            produsenDatas: 0
          }
        },
        {
          $lookup: {
            from: "addresses",
            localField: "dataToko.address",
            foreignField: "_id",
            as: "alamatToko"
          }
        },
        {
          $addFields: {
            "dataToko.alamat": { $arrayElemAt: ["$alamatToko", 0] }
          }
        },
        {
          $project: { alamatToko: 0 }
        },
        {
          $project: { userData: 0 }
        }
      ]);
      const productIds = dataProds.map(item => { return item._id } );
      const banners = await Promo.find({productId: { $in: productIds }});
      let productFlashSale;
      let productNotFlashSale;
      productFlashSale = dataProds.filter(item => { return item.isFlashSale });
      productNotFlashSale = dataProds.filter(item => { return !item.isFlashSale });
      

      return res.status(200).json({
        message: "Berhasil Mendapatkan Data",
        productFlashSale,
        productNotFlashSale,
        banners
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
      const dataProduct = await Product.findById(req.params.id).populate('categoryId').populate({
        path: 'userId',
        select: '-password -codeOtp -pin -saldo -poin'
      })
      let toko;
      if(!dataProduct) return res.status(404).json({message: `Product Id dengan ${req.params.id} tidak ditemukan`})
      switch(dataProduct.userId.role){
        case "vendor":
          toko = await Vendor.findOne({userId: dataProduct.userId._id}).select('-nomorAktaPerusahaan -npwpFile -legalitasBadanUsaha -nomorNpwpPerusahaan').populate('address');
          break;  
        case "supplier":
          toko = await Supplier.findOne({userId: dataProduct.userId._id}).select('-nomorAktaPerusahaan -npwpFile -legalitasBadanUsaha -nomorNpwpPerusahaan').populate('address');
          break;  
        case "produsen":
          toko = await Produsen.findOne({userId: dataProduct.userId._id}).select('-nomorAktaPerusahaan -npwpFile -legalitasBadanUsaha -nomorNpwpPerusahaan').populate('address');
          break;
      }
      
      if (!dataProduct) return res.status(404).json({ message: "product Not Found" });

      return res.status(200).json({ datas: dataProduct, toko });

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  upload: async (req, res, next) => {
    try {
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
      
      if(!req.files || req.files.length === 0) return res.status(400).json({message: "Produk harus memiliki foto. Minimal Satu"});

      const category = await SpecificCategory.findById(req.body.categoryId);
      if (!category) return res.status(400).json({ message: `Category dengan id: ${req.body.categoryId} tidak ada` });
      const subCategory = await SubCategory.findOne({contents: {$in: req.body.categoryId}});
      const mainCategory = await MainCategory.findOne({contents: {$in: subCategory._id}});
      
      let newProduct

      if( req.body.bervarian === "false" || !req.body.bervarian){
        const imgPaths = [];
      
        if(req.files.ImageProduct && req.files.ImageProduct.length !== 0){
          if (Array.isArray(req.files.ImageProduct) && req.files.ImageProduct.length > 0) {
            for (const img of req.files.ImageProduct){
              const nameImg = `${req.body.name_product.replace(/ /g, "_")}_${new Date().getTime()}${path.extname(img.name)}`
              const pathImg = path.join(__dirname, "../public", "img_products", nameImg );
              imgPaths.push(`${process.env.HOST}public/img_products/${nameImg}`)
              img.mv(pathImg, err => {
                if(err) return res.status(500).json({message: "Ada kesalahan saat nyimpan file, segera diperbaiki!"})
              })
            }
          } else {
            const nameImg = `${req.body.name_product.replace(/ /g, "_")}_${new Date().getTime()}${path.extname(req.files.ImageProduct.name)}`
            const pathImg = path.join(__dirname, "../public", "img_products", nameImg );
            req.files.ImageProduct.mv(pathImg, err => {
              if(err) return res.status(500).json({message: "Ada kesalahan saat nyimpan file, segera diperbaiki!"})
            })
            imgPaths.push(`${process.env.HOST}public/img_products/${nameImg}`)
          };
        };
        
        const dataProduct = req.body;

        dataProduct.image_product = imgPaths
        dataProduct.userId = req.user.id;
        newProduct = await Product.create({
          ...dataProduct,
          isPublished: true,
          id_sub_category: subCategory._id,
          id_main_category: mainCategory._id
        });

      }else{       
        if(!req.body.varian) return res.status(400).json({message: "Kurang Body Request *varian*"});
        const varian = [];
        req.body.varian.forEach(item => varian.push(JSON.parse(item)));
        const detailVarian = [];
        req.body.detailVarian.forEach(item => detailVarian.push(JSON.parse(item)));
        // if(detailVarian.length != varian[0].length * varian[1].length) return res.status(400).json({message: `Data yang dikirim tidak valid. Detail Varian panjangnya ${detailVarian.length} sedangkan varian panjangnya ${varian[0].nilai_varian.length * varian[1].nilai_varian.length}`})
        const final = detailVarian.map(item =>{
          if(Array.isArray(req.files[item.varian])) return res.status(400).json({message: "Image per Varian hanya boleh Satu!"});
          const namaImg = `${req.body.name_product}_${item.varian}_${path.extname(req.files[item.varian].name)}`;
          const pathImg = path.join(__dirname, "../public", "img_products", namaImg);
          req.files[item.varian].mv(pathImg, (err)=>{
            if(err) return res.status(500).json({message: "Ada Kesalahan Saat Nyimpan Image, segera diperbaiki"})
          })
          return {
            varian: item.varian,
            price: item.price,
            stok: item.stok,
            harga_diskon: item.harga_diskon,
            image: `${process.env.HOST}public/img_products/${namaImg}`
          };
        });
        delete req.body.varian
        delete req.body.detailVarian
        const dataProduct = {
          ...req.body,
          varian,
          detail_varian: final,
          id_main_category: mainCategory._id,
          id_sub_category: subCategory._id,
          userId: req.user.id
        }

        newProduct = await Product.create(dataProduct)
      }

      // await Performance.create({
      //   productId: newProduct._id,
      //   impressions: [{ time: new Date(), amount: 0 }],
      //   views: [{ time: new Date(), amount: 0 }]
      // });

      // await SalesReport.create({
      //   productId: newProduct._id,
      //   track: [{ time: new Date(), soldAtMoment: 0 }]
      // });

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
      if (product.userId.toString() !== req.user.id && req.user.role !== "administrator")
        return res
          .status(403)
          .json({ message: "Tidak bisa mengubah produk orang lain!" });

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