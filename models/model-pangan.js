const mongoose = require("mongoose");
const Decimal128 = mongoose.Types.Decimal128;

const modelPangan = new mongoose.Schema({
    kode_bahan: {
        type: String
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
    air:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    energi:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    protein:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    lemak:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    kh:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    serat:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    kalsium:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    fosfor:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    besi:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    natrium:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    kalium:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    tembaga:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    thiamin:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    riboflavin:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    },
    vitc:{
        value: { type: Decimal128 },
        deskripsi: { type: String }
    }
});

const modelKelompokPangan = new mongoose.Schema({
    nama: String,
    icon: String,
    deskripsi: String
})

const KelompokPangan = mongoose.model("KelompokPangan", modelKelompokPangan);
const Pangan = mongoose.model("Pangan", modelPangan);
module.exports = { Pangan, KelompokPangan };