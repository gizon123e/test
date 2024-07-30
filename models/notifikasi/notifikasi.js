const mongoose = require('mongoose');

const notifikasiSchema = new mongoose.Schema({
     orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pesanan",
          required: true,
     }
})