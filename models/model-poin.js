const mongoose = require("mongoose");
const modelPoin = new mongoose.Schema({
    from: [Object],
    value: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, 'kirimkan userId']
    },
    jenis: {
        type: String,
        enum: ["keluar", "masuk"]
    }
}, {timestamps: true});

const PoinHistory = mongoose.model("PoinHistory", modelPoin);

module.exports = PoinHistory