const mongoose = require('mongoose');

const modelPanduan = new mongoose.Schema({
    bank_id: {
        type: mongoose.Types.ObjectId,
        ref: "VirtualAccount"
    },
    content: {
        type: String
    }
});

const PanduanPembayaran = mongoose.model("PanduanPembayaran", modelPanduan);
module.exports = PanduanPembayaran