const mongoose = require("mongoose");

const productModels = new mongoose.Schema(
  {
    name_product: {
      type: String,
      maxlength: [250, "panjang nama harus antara 5 - 250 karakter"],
      minlength: [5, "panjang nama harus antara 5 - 250 karakter"],
      required: [true, "name_product harus di isi"],
    },
    jenis_produk:{
      type: String,
      enum: ["makanan", "not_makanan"]
    },
    price: {
      type: Number,
      required: [true, "price harus di isi"],
      min: [3, "price yang harus diisi setidaknya 100"],
    },
    total_price: {
      type: Number,
      required: false
    },
    diskon: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
    },
    long_description: {
      tyep: String,
      required: [true, "deskripsi harus diisi"],
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    minimalDp: {
      type: Number,
      min: 40
    },
    image_product: {
      type: [String],
      required: [true, "product harus memiliki setidaknya 1 gambar"],
    },
    varian: [{
      jenis_varian: {
        type: String,
        enum: ["ukuran", "warna", "model", "bahan", "motif"]
      },
      value: {
        type: String,
        
      }
    }],
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    warna: {
      type: [String],
      required: false,
    },
    size: {
      type: String,
      enum: ["small", "medium", "big"],
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
    varianRasa: {
      type: [String],
      required: false,
    },
    stok: {
      type: Number,
      required: true,
    },
    rasaLevel: {
      type: [String],
      required: false,
    },
    pemasok: {
      type: mongoose.Types.ObjectId,
      ref: "Supplier",
    },
    rating: {
      type: Number,
      default: 0
    },
    bahanBaku: [
      {
        _id: false,
        bahanBakuId: {
          type: mongoose.Types.ObjectId,
          ref: "BahanBaku",
          required: true
        },
        quantityNeed: {
          type: Number,
          required: true
        }
      }
    ],
    minimalOrder: {
      type: Number,
      default: 1
    },
    isFlashSale: {
      type: Boolean,
      default: false
    },
    panjang: {
      type: Number
    },
    lebar: {
      type: Number
    },
    tinggi: {
      type: Number
    },
    berat: {
      type: Number
    }
  },
  { timestamp: true }
);

//Check if there is discon for the product before save
productModels.pre("save", function (next) {
  if (this.diskon) {
    this.total_price = this.price - (this.price * this.diskon) / 100;
  } else {
    this.total_price = this.price
  }
  return next();
});

productModels.post("findOneAndUpdate", async function (doc, next) {
  try {
    const document = await this.model.findOne(this.getQuery());

    if (!document) {
      return next();
    }

    const updatedDoc = this._update;
    updatedDoc.total_price = updatedDoc.price - (updatedDoc.price * updatedDoc.diskon) / 100;
    await doc.save();
    return next();
  } catch (error) {
    return next(error);
  }
});

const Product = mongoose.model("Product", productModels);

module.exports = Product;
