const mongoose = require("mongoose");
const mongoose = require('mongoose');

const modelOrder = new mongoose.Schema({
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
        deadline: {
            type: Date,
            validate: {
                validator: (date) => {
                    const currentDate = new Date();
                    const minDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
                    return date >= minDate;
                },
                message: "Deadline minimal 7 hari ke depan"
            }
        },
        note: {
            type: String
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
        default: "Belum Bayar"
    },
    poinTerpakai: {
        type: Number
    },
    biaya_proteksi: {
        type: Boolean,
        default: false
    },
    biaya_asuransi: {
        type: Boolean,
        default: false
    },
    dp: {
        type: Boolean
    },
    is_dibatalkan: {
        type: Boolean,
        default: false
    },
    expire: {
        type: Date
    },
    shipments: [
        {
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
            kendaraanId: {
                type: mongoose.Types.ObjectId
            }
        }
    ]
}, { timestamp: true }
);
exports.modelOrder = modelOrder;const modelPengiriman = mongoose.Schema({
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    distributorId: {
        type: mongoose.Types.ObjectId,
        ref: "Distributtor"
    },
    waktu_pengiriman: {
        type: String
    },
    jenis_pengiriman: {
        type: String,
        enum: ["express", "hemat"]
    },
    ongkir: {
        type: Number
    },
    potongan_ongkir: {
        type: Number
    },
    kendaraanId: {
        type: mongoose.Types.ObjectId,
        ref: "KendaraanDistributor"
    },
    productToDelivers: [{
        productId: {
            type: String,
            ref: "Product"
        },
        quantity: {
            type: Number
        }
    }],
    status_pengiriman: {
        type: String,
        enum: ["diproses", "dikirim", "pesanan selesai"],
        default: "diproses"
    }
});
exports.modelPengiriman = modelPengiriman;

