const mongoose = require("mongoose");

const geraiRetailModel = mongoose.Schema({
    nama_gerai: {
        type: String
    },
    icon:{
        type: String
    }
});

const GeraiRetail = mongoose.model("GeraiRetail", geraiRetailModel);

module.exports = GeraiRetail;