const Product = require("../models/model-product");
const User = require("../models/model-auth-user");
const Category = require("../models/model-category");
const Performance = require('../models/model-laporan-kinerja-product')
  
module.exports = {

  list_product: async (req, res, next) => {
    try {
      const { search, category } = req.query;
      console.log(search, category)

      let handlerFilter = {};

      if (search) {
        handlerFilter = {
          ...handlerFilter,
          name_product: { $regex: new RegExp(search, "i") },
        };
      }

      if (category) {
        const categoryResoul = await Category.findOne({
          name: { $regex: category, $options: "i" },
        });

        if(!categoryResoul) return res.status(404).json({message: `Tidak Ditemukan product dengan kategori ${category}`})
        handlerFilter = { ...handlerFilter, categoryId: categoryResoul._id };
      }

      const list_product = await Product.find(handlerFilter)
        .populate("userId", "-password")
        .populate("categoryId");
      
      if(!list_product || list_product.length === 0 ) return res.status(404).json({message:`Product dengan nama ${search} serta dengan kategori ${category} tidak ditemukan`})

      return res.status(200).json({ datas: list_product });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  list_all: async(req, res, next) =>{
    try {
      if(req.user.role === "konsumen") return res.status(403).json({message: "Konsumen tidak bisa memiliki product"})
      const data = await Product.find({userId: req.user.id}).populate('userId', '-password')
      if(data){
        return res.status(200).json({message: "Menampilkan semua produk yang dimiliki user", data})
      }else{
        return res.status(404).json({message: "User tidak memiliki produk", data})
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  productDetail: async (req, res, next) => {
    try {
      const dataProduct = await Product.findOne({ _id: req.params.id });

      if (!dataProduct) return res.status(404).json({ message: "product Not Found" });

      return res.status(200).json({ datas: dataProduct });

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  upload: async (req, res, next) => {
    try {
      if(req.user.role === "konsumen") return res.status(403).json({message: "User dengan role konsumen tidak bisa menambah product"})

      if(req.user.role === "produsen" && !req.body.bahanBaku || (!Array.isArray(req.body.bahanBaku))){
        return res.status(400).json({
          message: "Produsen jika ingin menambah produk harus menyertakan bahanBaku dalam bentuk array of object"
        }) 
      }

      const category = await Category.findById(req.body.categoryId)
      if(!category) return res.status(400).json({message: `Category dengan id: ${req.body.categoryId} tidak ada`})
      
      const dataProduct = req.body;
      
      const user = await User.findById(req.user.id);
      dataProduct.userId = user._id;
      const newProduct = await Product.create(dataProduct);
      await Performance.create({
        productId: newProduct._id,
        impressions: [{ time: new Date(), amount: 0 }],
        views: [{ time: new Date(), amount: 0 }]
      })
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
      if (product.userId.toString() !== req.user.id)
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
  
  pemasok: async (req, res, next) => {
    try {
      const { product_id, pemasok } = req.body;
      const produk = await Product.findByIdAndUpdate(product_id, {$set:{ pemasok }});

      if (!produk) return res.status(404).json({ message: `Produk dengan id: ${product_id} tidak ditemukan` });
      
      if (produk.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak bisa mengubah produk orang lain!" });
      console.log(produk)
      return res.status(200).json({message: "Berhasil mengubah pemasok untuk produk ini produk ini", data: produk,});
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  updateProductPerformance: async(req, res, next) => {
    try {
      const { views, impressions } = req.query

      if(!views && !impressions ) return res.status(400).json({message:"Harus ada query views atau impressionss"})

      if(!req.body.productId) return res.status(400).json({message:"Dibutuh kan payload productId"})

      const kinerja = await Performance.findOne({productId: req.body.productId}).populate("productId")

      if(!kinerja) return res.status(404).json({message: `Tidak ditemukan product dengan id: ${req.body.productId}`})

      if(views && parseInt(views) !== NaN){
        for ( perform of kinerja.views ){
          perform.time.getDate() == new Date().getDate()? perform.amount+=parseInt(views) : kinerja.views.push({ time: newDate(), amount: views})
        }
      }
      
      if(impressions && parseInt(impressions) !== NaN){
        for (perform of kinerja.impressions){
          perform.time.getDate() == new Date().getDate()? perform.amount+=parseInt(impressions) : kinerja.impressions.push({ time: newDate(), amount: impressions})
        }
      }

      await kinerja.save({new: true})

      return res.status(200).json({message: "Berhasil update performance product!", data:kinerja})
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