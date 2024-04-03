const mongoose = require("mongoose");
const { Schema } = mongoose;

const user = new Schema({
    username: String,
    password: String,
    email: String,
    no_telepon: String,
    role: String,
    produk: Array
})

const User = mongoose.model("User", user);
module.exports = { User };
