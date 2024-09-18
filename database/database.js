const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const mongo_uri = process.env.MONGO_URI

// mongoose.connect("mongodb://pt_makan_bergizi_gratis:l3b4YpHUhG5mRvvlhywSsqZyMj8B941R@195.7.4.115:27017/pt_mbg")

mongoose.connect(mongo_uri)


const db = mongoose.connection;
module.exports = db