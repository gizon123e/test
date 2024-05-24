const mongoose = require("mongoose");
const Cart = require("./model-cart");
const Conversation = require("./model-conversation");
const Invoice = require("./model-invoice");
const Comment = require("./model-komentar");
const Minat = require("./model-minat-user");
const Pembatalan = require("./model-pembatalan");
const Product = require("./model-product")
const Produksi = require("./model-produksi");
const VirtualAccountUser = require("./model-user-va");
const Address = require("./model-address");
const BahanBaku = require("./model-bahan-baku");
const Pesanan = require("./model-orders");
const Vendor = require("./vendor/model-vendor");
const Distributor = require("./distributor/model-distributor");
const Supplier = require("./supplier/model-supplier");
const Produsen = require("./produsen/model-produsen");
const Konsumen = require("./konsumen/model-konsumen");


const userModels = new mongoose.Schema(
  {
    email: {
      content: {
        type: String,
        maxlength: [250, "panjang email harus di antara 3 - 250 karakter"],
        validate: {
          validator: (email) => {
            const emailRegex =
              /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/;
            return emailRegex.test(email);
          },
          message: (props) => `${props.value} email tidak valid`,
        },
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    password: {
      type: String,
      maxlength: [250, "panjang password harus di antara 3 - 250 karakter"],
      minlength: [3, "panjang password harus di antara 3 - 250 karakter"],
    },
    phone: {
      content:{
        type: String,
        minlength: [9, "panjang password harus di antara 3 - 250 karakter"],
        validate: {
          validator: (phone) => {
            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
            return regexNoTelepon.test(phone)
          },
          message: (props) => `${props.value} nomor handphone tidak valid`
        }
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    pin: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ["vendor", "konsumen", "produsen", "supplier", "distributor"],
      message: "{VALUE} is not supported",
    },
    kode_role:{
      type: String,
      get: function() {
        const roleCodes = {
          vendor: "VND",
          konsumen: "KNS",
          produsen: "PDS",
          supplier: "SPL",
          distributor: "DBR"
        };
        return roleCodes[this.role] || null;
      }
    },
    codeOtp:{
      code: {
        type: String
      },
      expire: {
        type: Date
      }
    },
    poin: {
      type: Number,
      default: 0
    },
    isActive:{
      type: Boolean,
      default: false,
      required: true
    },
    isDetailVerified:{
      type: Boolean,
      required: true,
      default: false
    },
    isBlocked:{
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
);

userModels.post("findOneAndDelete", async function(doc){
  try {
    const data = await Promise.all([
      Cart.find({userId: doc._id}),
      Conversation.find({participants: { $in:doc._id }}),
      Invoice.find({userId: doc._id}),
      Comment.find({userId: doc._id}),
      Minat.find({userId: doc._id}),
      Pembatalan.find({userId: doc._id}),
      Product.find({userId: doc._id}),
      Produksi.find({userId: doc._id}),
      VirtualAccountUser.find({userId: doc._id}),
      Address.find({userId: doc._id}),
      BahanBaku.find({userId: doc._id}),
      Pesanan.find({userId: doc._id}),
      Vendor.find({userId: doc._id}),
      Distributor.find({userId: doc._id}),
      Supplier.find({userId: doc._id}),
      Produsen.find({userId: doc._id}),
      Konsumen.find({userId: doc._id})
    ]);

    await Promise.all(data.map(async (modelData) => {
      await Promise.all(modelData.map(async (document) => {
        await document.deleteOne();
      }));
    }));

  } catch (error) {
      console.log(error)
  }
  
});

const User = mongoose.model("User", userModels);

module.exports = User;