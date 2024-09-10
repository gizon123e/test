const mongoose = require("mongoose");
const modelChat = new mongoose.Schema({
    participants: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        validate: [function arrayLimit(val) {
            return val.length <= 2;
        }, '{PATH} exceeds the limit of 2 participants']
    },
    messages: [
        {
            sender: { type: mongoose.Types.ObjectId, ref: 'User' },
            content: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Chat", modelChat);