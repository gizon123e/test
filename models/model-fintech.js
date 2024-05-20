const mongoose = require("mongoose");

const fintechModel = mongoose.Schema({
    nama_fintech: {
        type: String
    }
}, { collection: 'fintechs' });

const Fintech = mongoose.model("Fintech", fintechModel);

module.exports = Fintech;