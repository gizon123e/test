const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const mongo_uri = process.env.MONGO_URI
<<<<<<< HEAD
mongoose.connect("mongodb://mycl0ud1nd0:8zWH%2FhHL23cZxsYZNbMBRbOeM3rrE5kaKSlq0%2BqOx4i3zELjePBTjGr7LaTwENzU@195.7.4.115:27017/mycl0ud1ndo")
=======
mongoose.connect(mongo_uri)
>>>>>>> 42107167195c01a49947097a4a3223bcade9486e

const db = mongoose.connection;
db.on("error", console.log.bind(console, "databases connection error"));
db.on("open", () => console.log("databases connection success"));