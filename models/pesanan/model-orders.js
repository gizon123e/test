const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');
const Pembatalan = require('../model-pembatalan');

const modelOrder = new mongoose.Schema({
    items: [{
        _id: false,
        product: [{
            _id: false,
            productId: {
                type: String,
                required: [true, 'Productid harus di isi'],
                ref: 'Product',
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity harus di isi'],
                min: 1,
                default: 1
            },
            varian: [String],
            note: {
                type: String,
                default: null
            },
            proteksi: {
                type: Boolean,
                default: false
            },
            promo: {
                type: String
            }
        }],
        deadline: {
            type: Date,
            // validate: {
            //     validator: (date) => {
            //         const currentDate = new Date();
            //         const minDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
            //         return date.getTime() >= minDate.getTime()
            //     },
            //     message: "Deadline minimal 7 hari ke depan"
            // },
            required: true
        },
        kode_pesanan: {
            type: String
        },
        isDistributtorApproved: {
            type: Boolean,
            default: false
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        rejected: {
            type: Boolean,
            default: false
        }
    }],
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    addressId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'addressId harus di isi'],
        ref: 'Address'
    },
    date_order: {
        type: String,
        required: [true, 'date Order harus di isi']
    },
    status: {
        type: String,
        required: [true, 'status harus di isi'],
        enum: ["Belum Bayar", "Berlangsung", "Berhasil", "Dibatalkan"],
        message: `{VALUE} is not supported`,
        default: "Belum Bayar"
    },
    biaya_layanan: {
        type: Number
    },
    biaya_jasa_aplikasi: {
        type: Number
    },
    poinTerpakai: {
        type: Number
    },
    biaya_asuransi: {
        type: Boolean,
        default: false
    },
    biaya_awal_asuransi: {
        type: Number
    },
    biaya_awal_proteksi: {
        type: Number
    },
    dp: {
        isUsed: {
            type: Boolean
        },
        value: {
            type: Decimal128
        }
    },
    sekolahId: {
        type: mongoose.Types.ObjectId,
        ref: "Sekolah",
        default: null
    },
    shipments: [
        {
            _id: false,
            id_distributor: {
                type: mongoose.Types.ObjectId,
                ref: "Distributtor"
            },
            total_ongkir: {
                type: Number
            },
            potongan_ongkir: {
                type: Number
            },
            ongkir: {
                type: Number
            },
            products: [{
                productId: {
                    type: String,
                    ref: "Product"
                },
                quantity: {
                    type: Number
                },
            }],
            waktu_pengiriman: {
                type: Date
            },
            id_jenis_kendaraan: {
                type: mongoose.Types.ObjectId,
                ref: "JenisKendaraan"
            },
            id_jenis_layanan: {
                type: mongoose.Types.ObjectId,
                ref: "JenisJasaDistributor"
            },
            id_toko_vendor: {
                type: mongoose.Types.ObjectId,
                ref: "TokoVendor"
            }
        }
    ]
}, { timestamps: true }
)

// modelOrder.pre(["updateOne", "findByIdAndUpdate", "findOneAndUpdate", "updateMany"], async function (next){
// if(this.getUpdate().status === "Dibatalkan"){
//     const orders = await this.model.find(this.getQuery()).exec();

//     for (const order of orders) {
//         await Pembatalan.create({
//             pesananId: order._id,
//             userId: order.userId,
//             canceledBy: this.getUpdate().canceledBy,
//             reason: this.getUpdate().reason
//         });
//     }
// }
// else if(this.getUpdate().status === "Berlangsung"){
//     const orders = await this.model.find(this.getQuery()).lean();
//     for (const order of orders) {
//         const { items, ...restOfOrder } = order;
//         for( const item of items ){
//             const { product, ...restOfItem } = item;
//             for ( let prod of product ){
//                 const { productId, ...restOfProd } = prod
//                 const produk = await mongoose.model("Product").findById(productId).populate({ path: "userId", select: "_id role" }).lean()
//                 prod = {
//                     dataProduct: produk,
//                     ...restOfProd
//                 }

//                 item.product = prod
//             }
//         }
//         Object.assign(this.getUpdate(), order);
//     }
// }
// next()
// })
// const updateExpiredOrderStatus = async (order) => {
//     if (order.expire && order.expire < new Date() && order.status !== "Dibatalkan") {
//         order.status = "Dibatalkan";
//         order.is_dibatalkan = true;
//         await order.save();
//     }
// };

// Middleware to check expiry before executing find queries
// modelOrder.pre('find', async function (next) {
//     const orders = await this.model.find(this.getQuery());
//     for (const order of orders) {
//         await updateExpiredOrderStatus(order);
//     }
//     next();
// });

// modelOrder.pre('findOne', async function (next) {
//     const order = await this.model.findOne(this.getQuery());
//     if (order) {
//         await updateExpiredOrderStatus(order);
//     }
//     next();
// });

const Pesanan = mongoose.model('Pesanan', modelOrder)

module.exports = Pesanan