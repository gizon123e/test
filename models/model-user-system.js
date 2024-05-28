const mongoose = require("mongoose");


const system_user_models = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        default: "administrator"
    }
})

const User_System = mongoose.model("User_System", system_user_models);

module.exports = User_System;