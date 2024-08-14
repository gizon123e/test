const mongoose = require("mongoose");

const modelFollower = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    sellerUserId:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
})

const Follower = mongoose.model('Follower', modelFollower);

module.exports = Follower;