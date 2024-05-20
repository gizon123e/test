const mongoose = require("mongoose");

const geraiRetailModel = mongoose.Schema({
    nama_gerai: {
        type: String
    },
    icon:{
        type: String
    }
}, { collection: 'gerairetails' });

const GeraiRetail = mongoose.model("GeraiRetail", geraiRetailModel);

module.exports = GeraiRetail;