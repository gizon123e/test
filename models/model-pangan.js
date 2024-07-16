const mongoose = require("mongoose");
const Decimal128 = mongoose.Types.Decimal128;

const modelPangan = new mongoose.Schema({
    kode_bahan: {
        type: String,
        index: true
    },
    nama_bahan: {
        type: String
    },
    kelompok_pangan:{
        type: String
    },
    jenis_pangan:{
        type: String
    },
    nama_makanan_lokal: {
        type: String
    },
    mayoritas_daerah_lokal: {
        type: String
    },
    keterangan: {
        type: String
    },
    nama_latin: {
      type: String
    },
    genus:{
      type: String
    },
    familia:{
      type: String
    },
    air:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    energi:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    protein:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    lemak:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    kh:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    serat:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    kalsium:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    fosfor:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    besi:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    natrium:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    kalium:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    tembaga:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    thiamin:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    riboflavin:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    },
    vitc:{
        value: { type: Decimal128 },
        simbol: { type: String },
        deskripsi: { type: String }
    }
});

const modelKelompokPangan = new mongoose.Schema({
    nama: String,
    icon: String,
    deskripsi: String
});

const modelKebutuhanGizi = new mongoose.Schema({
    ageRange: {
      type: String,
      required: true,
      enum: ['3-6', '7-9', '10-12', '13-17']
    },
    protein: {
      type: [Number],
      required: true,
    },
    lemak: {
      type: Number,
      required: true,
    },
    karbohidrat: {
      type: [Number],
      required: true,
    },
    serat: {
      type: [Number],
      required: true,
    },
    kalsium: {
      type: Number,
      required: true,
    },
    fosfor: {
      type: Number,
      required: true,
    },
    besi: {
      type: Number,
      required: true,
    },
    natrium: {
      type: Number,
      required: true,
    },
    kalium: {
      type: Number,
      required: true,
    },
    tembaga: {
      type: [Number],
      required: true,
    },
    thiamin: {
      type: Number,
      required: true,
    },
    riboflavin: {
      type: Number,
      required: true,
    },
    vitaminC: {
      type: Number,
      required: true,
    },
    kalori: {
      type: Number,
      required: true,
    }
});
  
const KebutuhanGizi = mongoose.model('KebutuhanGizi', modelKebutuhanGizi);
const KelompokPangan = mongoose.model("KelompokPangan", modelKelompokPangan);
const Pangan = mongoose.model("Pangan", modelPangan);
module.exports = { Pangan, KelompokPangan, KebutuhanGizi };