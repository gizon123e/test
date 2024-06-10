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
const TokoVendor = require("./vendor/model-toko")


const userModels = new mongoose.Schema(
  {
    email: {
      content: {
        type: String,
        maxlength: [250, "panjang email harus di antara 3 - 250 karakter"],
        validate: {
          validator: (email) => {
            if (email === null) return true
            const emailRegex =
              /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/;
            return emailRegex.test(email);
          },
          message: (props) => `${props.value} email tidak valid`,
        },
        default: null
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    password: {
      type: String,
    },
    phone: {
      content: {
        type: String,
        validate: {
          validator: (phone) => validationPhone(phone),
          message: (props) => `${props.value} nomor handphone tidak valid`
        },
        default: null
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
    kode_role: {
      type: String,
      get: function () {
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
    codeOtp: {
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
    saldo: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true
    },
    isDetailVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false
    },
    pesanPenolakan: {
      type: String,
      required: false
    },
    isVerifikasiDocument: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  { timestamps: true }
);

userModels.pre('findOneAndUpdate', function (next) {
  if (this.getUpdate()['phone.content'] !== undefined) {
    const isValid = validationPhone(this.getUpdate()['phone.content'])
    if (!isValid) throw new Error(`${this.getUpdate()['phone.content']} nomor tidak valid`)
  }
  next()
})

userModels.post("findOneAndDelete", async function (doc) {
  try {

      await Cart.deleteMany({ userId: doc._id })
      await Conversation.deleteMany({ participants: { $in: doc._id } })
      await Invoice.deleteMany({ userId: doc._id })
      await Comment.deleteMany({ userId: doc._id })
      await Minat.deleteMany({ userId: doc._id })
      await Pembatalan.deleteMany({ userId: doc._id })
      await Product.deleteMany({ userId: doc._id })
      await Produksi.deleteMany({ userId: doc._id })
      await VirtualAccountUser.deleteMany({ userId: doc._id })
      await Address.deleteMany({ userId: doc._id })
      await BahanBaku.deleteMany({ userId: doc._id })
      await Pesanan.deleteMany({ userId: doc._id })
      await Vendor.deleteMany({ userId: doc._id })
      await Distributor.deleteMany({ userId: doc._id })
      await Supplier.deleteMany({ userId: doc._id })
      await Produsen.deleteMany({ userId: doc._id })
      await Konsumen.deleteMany({ userId: doc._id })
      await TokoVendor.deleteMany({userId: doc._id})

  } catch (error) {
    console.log(error)
  }

});

function validationPhone(phone) {
  const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
  if (phone === null) return true
  return regexNoTelepon.test(phone)
}

const User = mongoose.model("User", userModels);

module.exports = User;