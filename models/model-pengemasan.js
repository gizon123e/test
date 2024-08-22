const mongoose = require("mongoose");
const modelPengemasan = new mongoose.Schema({
     pengirimanId: {
         type: mongoose.Types.ObjectId,
         ref: "Pengiriman",
         required: true
     },
     total_quantity: {
          type: Number,
          required: [true, "total_quantity harus diisi"]
     },
     total_jarak: {
          type: Number,
          required: [true, "total_jarak harus diisi"]
     },
     waktu_pengemasan: {
          type: Number,
          required: [true, "waktu_pengemasan harus diisi"]
     },
     waktu_pengiriman: {
          type: Number,
          required: [true, "waktu_pengiriman harus diisi"]
     },
     total_pengemasan_pengiriman: {
          type: Number,
          required: [true, "total_pengemasan_pengiriman harus diisi"]
     }
})

const Pengemasan = mongoose.model("Pengemasan", modelPengemasan);

module.exports = Pengemasan