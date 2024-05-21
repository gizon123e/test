require("./database/database");
const flash_sale_checker = require('./utils/flash-sale-checker');
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
app.use(bodyParser.json({ limit: '250mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
global.__basedir = __dirname;

// router
app.get('/failed', (req, res) => {
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
app.use("/api/vendor", require('./routes/router-vendor'));
app.use("/api/supplier", require('./routes/router-supplier'));
app.use("/api/data/produsen", require('./routes/router-data-produsen'));
app.use("/api/konsumen", require('./routes/router-konsumen'));
app.use("/api/konsumen/pic", require('./routes/router-konsumen-pic'));

// router distributtor
app.use("/api/distributor", require('./routes/router-distributtor/router-distributtor'));
app.use('/api/document-distributor', require('./routes/router-distributtor/router-document-distributtor'));
app.use('/api/alamat-ditributtor', require('./routes/router-distributtor/router-alamat-distributtor'))
app.use('/api/penanggung-jawab-distributtor', require('./routes/router-distributtor/router-penanggungjawab'))
app.use('/api/document-penanggungan-jawab', require('./routes/router-distributtor/router-document-penanggungJawab'))
app.use('/api/alamat-penanggung-jawab', require('./routes/router-distributtor/router-alamatPenanggungJawab'))
app.use('/api/kendaraan-distributtor', require('./routes/router-distributtor/router-kendaraaanDistributtor'))

app.use('/api/payment', require('./routes/router-payment'));
app.use('/api/resend-otp', require('./routes/router-resendOtp'));
app.use('/api/login/google-oauth', require('./routes/router-login-google-oauth'));
app.use('/api/register/google-oauth', require('./routes/router-register-google-oauth'));
app.use('/api/promo', require('./routes/router-promo'));
app.use('/api/minat', require('./routes/router-minat'));
app.use('/api/flash-sale', require('./routes/router-flash-sale'));
app.use('/api/alamat', require('./routes/router-alamat'));

// Admin Panel
app.use('/api/user-system', require('./routes/router-system-user'));
app.use('/api/panel', require('./routes/router-adminPanel/router-adminPanel'))
app.use('/api/biaya_tetap', require('./routes/router-biaya-tetap'));
app.use('/api/metode_pembayaran', require('./routes/router-metode-pembayaran'));


// midelware error
app.use(require("./midelware/error-midelware"));

app.listen(4000, () => {
  flash_sale_checker.start()
  console.log("connection express success");
  websocket.listen(5000, () => {
    console.log("Connection websocket success");
  });
});
