const mongoose = require("mongoose");

const ewalletModel = mongoose.Schema({
    nama_ewallet: {
        type: String
    }
}, { collection: 'ewallets' });

const Ewallet = mongoose.model("Ewallet", ewalletModel);

module.exports = Ewallet;