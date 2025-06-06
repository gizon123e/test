const mongoose = require("mongoose");
const Cart = require("./model-cart");
const Conversation = require("./model-conversation");
const Invoice = require("./model-invoice");
const Comment = require("./model-komentar");
const Minat = require("./model-minat-user");
const Pembatalan = require("./model-pembatalan");
const Product = require("./model-product")
const {Transaksi, Transaksi2} = require("./model-transaksi");
const Produksi = require("./produsen/bahan/model-produksi");
const VirtualAccountUser = require("./model-user-va");
const Address = require("./model-address");
const BahanBaku = require("./produsen/bahan/model-bahan-baku");
const Pesanan = require("./pesanan/model-orders");
const Vendor = require("./vendor/model-vendor");
const Distributor = require("./distributor/model-distributor");
const Supplier = require("./supplier/model-supplier");
const Produsen = require("./produsen/model-produsen");
const Konsumen = require("./konsumen/model-konsumen");
const TokoVendor = require("./vendor/model-toko");
const ModelPenanggungJawabKonsumen = require("./konsumen/model-penanggung-jawab");
const Sekolah = require("./model-sekolah");
const TokoSupplier = require("./supplier/model-toko");
const TokoProdusen = require("./produsen/model-toko");
const Follower = require("./model-follower");
const PoinHistory = require("./model-poin");
const Wishlist = require("./model-wishlist");
const ReviewProduk = require("./model-review/model-reviewProduk");
const Notifikasi = require("./notifikasi/notifikasi");


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
    lastOnline:{
      type: Date,
      default: new Date(1999, 7, 1)
    },
    token: {
      value: {
        type: String,
        default: null
      },
      expired: {
        type: Date,
        default: null
      },
      verified: {
        type: Boolean,
        default: false
      }
    }
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
    await Cart.deleteMany({ userId: doc._id });
    console.log('Deleted all Cart documents for user:', doc._id);

    await ReviewProduk.deleteMany({ userId: doc._id });

    await Notifikasi.deleteMany({ userId: doc._id });

    await Conversation.deleteMany({ participants: { $in: doc._id } });
    console.log('Deleted all Conversation documents for user:', doc._id);

    await Invoice.deleteMany({ userId: doc._id });
    console.log('Deleted all Invoice documents for user:', doc._id);

    await Comment.deleteMany({ userId: doc._id });
    console.log('Deleted all Comment documents for user:', doc._id);

    await Transaksi.deleteMany({ userId: doc._id });
    console.log('Deleted all Comment documents for user:', doc._id);

    await Transaksi2.deleteMany({ userId: doc._id });
    console.log('Deleted all Comment documents for user:', doc._id);

    await Follower.deleteMany({ userId: doc._id });
    console.log('Deleted all Follow documents for user:', doc._id);

    await PoinHistory.deleteMany({ userId: doc._id });
    console.log('Deleted all Poin documents for user:', doc._id);

    await Minat.deleteMany({ userId: doc._id });
    console.log('Deleted all Minat documents for user:', doc._id);

    await Pembatalan.deleteMany({ userId: doc._id });
    console.log('Deleted all Pembatalan documents for user:', doc._id);

    await Product.deleteMany({ userId: doc._id });
    console.log('Deleted all Product documents for user:', doc._id);

    await Produksi.deleteMany({ userId: doc._id });
    console.log('Deleted all Produksi documents for user:', doc._id);

    Wish

    await VirtualAccountUser.deleteMany({ userId: doc._id });
    console.log('Deleted all VirtualAccountUser documents for user:', doc._id);

    await Address.deleteMany({ userId: doc._id });
    console.log('Deleted all Address documents for user:', doc._id);

    await BahanBaku.deleteMany({ userId: doc._id });
    console.log('Deleted all BahanBaku documents for user:', doc._id);

    await Pesanan.deleteMany({ userId: doc._id });
    console.log('Deleted all Pesanan documents for user:', doc._id);

    await Vendor.deleteMany({ userId: doc._id });
    await TokoVendor.deleteMany({ userId: doc._id });
    console.log('Deleted all Vendor documents for user:', doc._id);

    await Wishlist.deleteMany({ userId: doc._id });

    await Distributor.deleteMany({ userId: doc._id });
    console.log('Deleted all Distributor documents for user:', doc._id);

    await Supplier.deleteMany({ userId: doc._id });
    await TokoSupplier.deleteMany({ userId: doc._id });

    console.log('Deleted all Supplier documents for user:', doc._id);

    await Produsen.deleteMany({ userId: doc._id });
    await TokoProdusen.deleteMany({ userId: doc._id });
    console.log('Deleted all Produsen documents for user:', doc._id);

    await Konsumen.deleteMany({ userId: doc._id });
    console.log('Deleted all Konsumen documents for user:', doc._id);

    await ModelPenanggungJawabKonsumen.deleteMany({ userId: doc._id });
    console.log('Deleted all ModelPenanggungJawabKonsumen documents for user:', doc._id);

    await Address.deleteMany({ userId: doc._id });
    console.log('Deleted all Address documents for user:', doc._id);

    await Sekolah.deleteMany({ userId: doc._id });
    console.log('Deleted all Sekolah documents for user:', doc._id);

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