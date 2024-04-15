const mongoose = require("mongoose");
require("./model-auth-user");
require("./model-product");
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  messages: [
    {
      sender: { type: mongoose.Types.ObjectId, ref: "User" },
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
