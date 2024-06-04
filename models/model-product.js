const mongoose = require("mongoose");

const varianSchema = new mongoose.Schema({
  _id: false,
  jenis_varian: {
    type: String,
    validate: {
      validator: (value) => {
        const food = ['klasik', "buah", "gurih", 'rempah', 'sambal']
        const notFood = ["ukuran", "warna", "model", "bahan", "motif"]
        if(this.jenis_produk === 'makanan' && !food.includes(value)) return false
        if(this.jenis_produk === 'not_makanan' && !notFood.includes(value)) return false
        return true
      },
      message: (props) => `${props.value} varian tidak cocok untuk jenis produk`
    }
  },
  nilai: [{
    value:{
      type: String
    },
    jenis_value: {
      type: String
    },
    stok_value: {
      type: Number
    },
    minimalOrder_value:{
      type: Number
    },
    harga_value:{
      type: Number
    },
    harga_diskon:{
      type: Number
    }
  }]
})

const productModels = new mongoose.Schema(
  {
    _id:{
      type: String,
      default: () => `Prod-${new mongoose.Types.ObjectId().toString()}`
    },
    bervarian:{
      type: Boolean,
    },
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
      type: String,
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
    varian:{
      type: [varianSchema],
      maxlength: [2, 'hanya bisa memiliki 2 varian']
    },
    isPublished:{
      type: Boolean,
      required: true,
      default: false
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false
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
    },
    pemasok: {
      type: mongoose.Types.ObjectId,
      ref: "Supplier",
      default: null
    },
    rating: {
      type: Number,
      default: 0
    },
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
    },
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
  { timestamp: true }
);

//Check if there is discon for the product before save
productModels.pre("save", function (next) {
  if (this.diskon) {
    this.total_price = this.price - (this.price * this.diskon) / 100;
  } else {
    this.total_price = this.price
  }

  if(this.bervarian){
    this.varian.forEach(item => {
      this.total_stok += item.stok
    })
  }

  if(this.bervarian && this.minimalOrder){
    return next("Atur minimal order per varian di properti objek varian")
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
