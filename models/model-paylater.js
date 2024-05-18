const mongoose = require("mongoose");

const paylaterModel = mongoose.Schema({
    nama_paylater: {
        type: String
    }
}, { collection: 'paylaters' });

const Paylater = mongoose.model("Paylater", paylaterModel);

module.exports = Paylater;