const mongoose = require('mongoose');

const ModelDetailPesanan = mongoose.Schema({
    id_pesanan:{
        type: mongoose.Types.ObjectId,
        ref: "Pesanan",
        required: true
    },
    total_price:{
        type: Number,
        required: true
    },
    jumlah_dp:{
        type: Number,
        default: 0
    },
    id_va: { 
        type: mongoose.Types.ObjectId, 
        ref: 'VirtualAccount', 
        default: null 
    },
    id_ewallet: { 
        type: mongoose.Types.ObjectId, 
        ref: 'EWallet', 
        default: null 
    },
    id_gerai_tunai:{
        type: mongoose.Types.ObjectId,
        ref: "GeraiTunai",
        default: null
    },
    id_fintech:{
        type: mongoose.Types.ObjectId,
        ref: "Fintech",
        default: null
    },
    biaya_jasa_aplikasi:{
        type: Number,
        required: true
    },
    biaya_layanan:{
        type: Number,
        required: true
    },
    biaya_asuransi:{
        type: Number,
    },
    biaya_proteksi:{
        type: Number
    },
    isTerbayarkan:{
        type: Boolean,
        default: false
    }
});

const DetailPesanan = mongoose.model("DetailPesanan", ModelDetailPesanan);

module.exports = DetailPesanan;