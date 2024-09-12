const mongoose = require("mongoose");

const model = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    reason: {
        type: String
    },
    status: {
        type: String,
        enum: ["requested", "accepted", "rejected"],
        default: "requested"
    }
}, { timestamps: true });

const RequestDeleteAccount = mongoose.model("RequestDeleteAccount", model);
module.exports = RequestDeleteAccount