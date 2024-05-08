require("./database/database");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const path = require('path');
const websocket = require("./websocket/index-ws");
const session = require("express-session");
const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: process.env.SECRETKEY,
  cookie: { secure: true }
}));
app.use(bodyParser.json({limit: '250mb'}));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
global.__basedir = __dirname;

// router
app.get('/failed', (req, res)=>{
  res.send("Failed");
});
app.use('/api/verify-otp', require('./routes/router-verifyOtp'));
app.use('/api/user', require('./routes/router-user'));
app.use('/api/product', require('./routes/router-product'));
app.use('/api/category', require('./routes/router-category'));
app.use('/api/cart', require('./routes/router-carts'));
app.use('/api/address', require('./routes/router-address'));
app.use('/api/order', require('./routes/router-order'));
app.use("/api/report", require("./routes/router-laporan"));
app.use("/api/produsen", require("./routes/router-produsen"));
app.use("/api/comment", require("./routes/router-komentar"));
app.use("/api/export", require("./routes/router-export"));
app.use("/api/distributor", require('./routes/router-distributtor'));
app.use("/api/vendor", require('./routes/router-vendor'));
app.use("/api/supplier", require('./routes/router-supplier'));
app.use("/api/data/produsen", require('./routes/router-data-produsen'));
app.use("/api/konsumen", require('./routes/router-konsumen'));
app.use('/api/order-distributor', require('./routes/router-order-distributtor'));
app.use('/api/payment', require('./routes/router-payment'));
app.use('/api/login/google-oauth', require('./routes/router-login-google-oauth'));
app.use('/api/register/google-oauth', require('./routes/router-register-google-oauth'));


// midelware error
app.use(require("./midelware/error-midelware"));

app.listen(4000, () => {
  console.log("connection express success");
  websocket.listen(5000, () => {
    console.log("Connection websocket success");
  });
});
