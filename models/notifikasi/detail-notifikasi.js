const mongoose = require('mongoose');

const detailNotifikasiSchema = new mongoose.Schema({
     notifikasiId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Notifikasi",
          required: [true, "notifikasiId harus di isi"],
     },
     status: {
          type: String,
          required: [true, "status harus di isi"]
     },
     message: {
          type: String,
          required: [true, "message harus di isi"]
     },
     jenis:{
          type: String,
          required: [true, "jenis harus di isi"]
     },
     image_product: {
          type: String,
          default: [true, "jenis harus di isi"]
     },
     is_read: {
          type: Boolean,
          default: false
     },   
     createdAt: {
      type: Date,
      default: new Date(),
    },
})

const DetailNotifikasi = mongoose.model("DetailNotifikasi", detailNotifikasiSchema);
module.exports = DetailNotifikasi