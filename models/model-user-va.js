const mongoose = require("mongoose");

const modelVirtualAccountUser = mongoose.Schema({
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
    }
});

const VirtualAccountUser = mongoose.model("VirtualAccountUser", modelVirtualAccountUser);

module.exports = VirtualAccountUser;