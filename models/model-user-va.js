const mongoose = require("mongoose");

const modelVirtualAccountUser = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    nomor_va:{
        type: String
    },
    nama_bank:{
        type: mongoose.Types.ObjectId,
        ref: "VirtualAccount"
    },
    nama_virtual_account:{
        type: String,
        required: true
    }
});

const VirtualAccountUser = mongoose.model("VirtualAccountUser", modelVirtualAccountUser);

module.exports = VirtualAccountUser;