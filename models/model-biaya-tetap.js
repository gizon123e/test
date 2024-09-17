const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const modelBiayaTetap = mongoose.Schema({
  biaya_proteksi: {
    type: Number,
  },
  biaya_asuransi: {
    type: Number,
  },
  biaya_layanan: {
    type: Number,
  },
  biaya_jasa_aplikasi: {
    type: Number,
  },
  nilai_koin: {
    type: Decimal128,
  },
  biaya_per_kg: {
    type: Number,
  },
  constanta_volume: {
    type: Number,
  },
  lama_pengemasan: {
    type: Number,
  },
  rerata_kecepatan: {
    type: Number,
  },
  nilai_toleransi: {
    type: Number,
  },
  radius: {
    type: Number,
  },
  notif_rekomen_vendor: {
    type: String,
  },
  max_pengemasan_pengiriman: {
    type: Number
  },
  fee_payment_gateway: {
    type: Number
  },
  fee_udinpay: {
    type: Number
  },
  kelompok_topping: {
    type: String
  },
  poinRating: {
    type: Number
  },
  poinPembelian: {
    type: Number
  }
});

const BiayaTetap = mongoose.model("BiayaTetap", modelBiayaTetap);

module.exports = BiayaTetap;
