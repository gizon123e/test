const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const mongo_uri = process.env.MONGO_URI
// mongoose.connect("mongodb://mycl0ud1nd0:8zWH%2FhHL23cZxsYZNbMBRbOeM3rrE5kaKSlq0%2BqOx4i3zELjePBTjGr7LaTwENzU@195.7.4.115:27017/mycl0ud1ndo")
mongoose.connect("mongodb+srv://muhammadnurfisyalt:cBGtG6pO7KsovstY@cluster0.r4zv3uh.mongodb.net/mycloudindo?retryWrites=true&w=majority&appName=Cluster0")

const db = mongoose.connection;
db.on("error", console.log.bind(console, "databases connection error"));
db.on("open", () => console.log("databases connection success"));