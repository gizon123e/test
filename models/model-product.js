const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Carts = require("./model-cart");

const varianSchema = new mongoose.Schema({
  _id: false,
  nama_varian: {
    type: String,
  },
  nilai_varian: [
    {
      _id: false,
      nama: {
        type: String,
      },
      harga: {
        type: Number,
      },
    },
  ],
});

// const detailVarianSchema = new mongoose.Schema({
//   varian:{
//     type: String
//   },
//   price: {
//     type: Number
//   },
//   stok: {
//     type: Number
//   },
//   image:{
//     type: String
//   },
//   minimalOrder: {
//     type: String
//   },
//   harga_diskon:{
//     type: String
//   }
// });

// detailVarianSchema.plugin(uniqueValidator);

const productModels = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `Prod-${new mongoose.Types.ObjectId().toString()}`,
    },
    bervarian: {
      type: Boolean,
      default: false,
    },
    name_product: {
      type: String,
      maxlength: [250, "panjang nama harus antara 5 - 250 karakter"],
      minlength: [5, "panjang nama harus antara 5 - 250 karakter"],
      required: [true, "name_product harus di isi"],
    },
    price: {
      type: Number,
      required: [true, "price harus di isi"],
      min: [100, "price yang harus diisi setidaknya 100"],
    },
    total_price: {
      type: Number,
      required: false,
    },
    diskon: {
      type: Number,
      required: false,
      validate: {
        validator: (value) => {
          if (value > 100) return false;
        },
        message: (props) =>
          `Diskon tidak bisa melebihi 100%. Diskon yang dimasukan ${props.value}%`,
      },
    },
    description: {
      type: String,
    },
    long_description: {
      type: String,
      required: [true, "deskripsi harus diisi"],
    },
    minimalDp: {
      type: Number,
      min: 40,
    },
    image_product: {
      type: [String],
      required: [true, "product harus memiliki setidaknya 1 gambar"],
    },
    varian: {
      type: [varianSchema],
      default: () => null,
      maxlength: [2, "hanya bisa 2 jenis varian"],
    },
    status: {
      value: {
        type: String,
        enum: ["ditinjau", "terpublish", "ditolak", "diblokir", "diarsipkan"],
        message: "{VALUE} is not supported",
        default: "ditinjau",
      },
      message: {
        type: String,
        default: "Produk kamu sedang dalam proses tinjauan superapp. Produk kamu akan segera terunggah setelah tinjauan selesai.",
      },
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    id_main_category: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "MainCategory",
    },
    id_sub_category: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "SubCategory",
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "SpecificCategory",
    },
    total_stok: {
      type: Number,
      required: true,
      default: 0,
    },
    pemasok: {
      type: mongoose.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
    },
    minimalOrder: {
      type: Number,
    },
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    panjang: {
      type: Number,
      required: true,
    },
    lebar: {
      type: Number,
      required: true,
    },
    tinggi: {
      type: Number,
      required: true,
    },
    berat: {
      type: Number,
      required: true,
    },
    isReviewed: {
      type: Boolean,
      default: false
    },
    pangan:[{
      _id: false,
      panganId: {
        type: mongoose.Types.ObjectId,
        ref: "Pangan"
      },
      berat: {
        type: Number
      }
    }]
    // bahanBaku: [
    //   {
    //     _id: false,
    //     bahanBakuId: {
    //       type: mongoose.Types.ObjectId,
    //       ref: "BahanBaku",
    //       required: true
    //     },
    //     quantityNeed: {
    //       type: Number,
    //       required: true
    //     }
    //   }
    // ],
  },
  { timestamps: true }
);

// function hasNoDuplicates(detailVarianArray) {
//   const varianSet = new Set();
//   if(detailVarianArray !== null){
//     for (const detailVarian of detailVarianArray) {
//       const varianKey = `${detailVarian.varian}-${detailVarian.price}-${detailVarian.stok}-${detailVarian.minimalOrder}-${detailVarian.harga_diskon}`;
//       if (varianSet.has(varianKey)) {
//         return false;
//       }
//       varianSet.add(varianKey);
//     }
//   }
//   return true;
// }

//Check if there is discon for the product before save
productModels.pre("save", function (next) {
  if (this.diskon) {
    this.total_price = this.price - (this.price * this.diskon) / 100;
  } else {
    this.total_price = this.price;
  }

  const minimalDp = parseInt(this.minimalDp);

  // Check for minimalDp conditions
  if (minimalDp < 40 && minimalDp !== 0) {
    return next(new Error("minimalDp tidak boleh kurang dari 40%"));
  }

  if(minimalDp === 0) this.minimalDp = null
  // if(this.bervarian === true || this.bervarian === "true" && this.detail_varian){
  //   this.detail_varian.forEach(element => {
  //     this.total_stok += element.stok
  //   });
  // }

  // if(this.bervarian && this.minimalOrder){
  //   next("Atur minimal order per varian di properti objek varian")
  // }

  next();
});

productModels.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    const minimalDp = parseInt(update.minimalDp);

    // Check for minimalDp conditions
    if (minimalDp < 40 && minimalDp !== 0) {
      return next(new Error("minimalDp tidak boleh kurang dari 40%"));
    }

    // Find the current document
    const document = await this.model.findOne(this.getQuery());
    if (!document) {
      return next();
    }

    // Handle minimalDp value
    if (minimalDp === 0) {
      update.minimalDp = null;
    }

    // Calculate and set the total_price
    if(update.diskon){
      update.total_price = update.price - (update.price * update.diskon) / 100;
    }

    // Update the document with new values
    this.setUpdate(update);

    console.log(update);
    next();
  } catch (error) {
    next(error);
  }
});


productModels.pre(["deleteMany", "deleteOne", "findOneAndDelete"], async function (next){
  try {
    const products = await this.model.find(this.getQuery()).populate({ path: 'userId', select: "_id role"}).lean()
    for(const prod of products){
      await Carts.updateMany(
        { productId: prod._id },
        { 
          productTerhapus: { 
            _id: prod._id, 
            name_product: prod.name_product, 
            total_price: prod.total_price, 
            image_product: prod.image_product,
            userId: {
              _id: prod.userId._id,
              role: prod.userId.role
            }
          },
          productDeleted: true
        }
      )
    }
    console.log(products)
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const Product = mongoose.model("Product", productModels);

module.exports = Product;
