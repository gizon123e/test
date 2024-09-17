const mongoose = require("mongoose");

const ModelSaldoApps = mongoose.Schema({
    nama:{
        type: String,
        enum: ["saldo", "poin"]
    }
});

const SaldoApps = mongoose.model("SaldoApps", ModelSaldoApps);

module.exports = SaldoApps