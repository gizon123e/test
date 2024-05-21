const mongoose = require("mongoose");

const modelVirtualAccount = mongoose.Schema({
    nama_bank:{
        type: String,
    },
    kode_perusahaan:{
        type: String
    },
    nama_va:{
        type: String,
        //{SuperApp - Nama Lengkap User}
    },
    icon:{
        type: String
    }
}, { collection: 'virtualaccounts' })

const VirtualAccount = mongoose.model("VirtualAccount", modelVirtualAccount);

module.exports = VirtualAccount