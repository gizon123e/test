const mongoose = require('mongoose');

const notifikasiSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "userId harus di isi"],
    },
    invoiceId: {
     type: mongoose.Types.ObjectId,
     ref: "Invoice",
     required: [true, "invoiceId harus di isi"],
    }, 
    jenis_invoice: {
     type: String,
     enum: ["Subsidi", "Non Subsidi"],
     message: "{VALUE} is not supported",
    }, 
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
);

const Notifikasi = mongoose.model("Notifikasi", notifikasiSchema);

module.exports = Notifikasi;