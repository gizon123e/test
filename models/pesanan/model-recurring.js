const mongoose = require("mongoose");
const model = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: String,
        ref: "Product",
        required: true
    }
})

const Recurring = mongoose.model("Recurring", model);
module.exports = Recurring