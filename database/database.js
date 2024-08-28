const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const mongo_uri = process.env.MONGO_URI
mongoose.connect(mongo_uri)

const db = mongoose.connection;
db.on("error", console.log.bind(console, "databases connection error"));
db.on("open", () => console.log("databases connection success"));
