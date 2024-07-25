require("./database/database");
const flash_sale_checker = require('./utils/flash-sale-checker');
const checker_order = require("./utils/cancel-order")
const http = require('http');
const https = require('https')
const fs = require('fs');
const { batalPesanan } = require('./utils/pembatalan-distributor')
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const path = require('path');
const websocket = require("./websocket/index-ws");
const socketIo = require('socket.io')
const initSocketIo = require('./utils/pelacakanDistributor')
const initializeChatSocket = require('./controler/message/vendor-distributor/vendor-distributor');

const dotenv = require('dotenv')
dotenv.config()

// Sertifikat SSL
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/staging-backend.superdigitalapps.my.id/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/staging-backend.superdigitalapps.my.id/fullchain.pem', 'utf8');
// const privateKey = fs.readFileSync(`${process.env.SSLKEY}`, 'utf8');
// const certificate = fs.readFileSync(`${process.env.SSLCERTIFIKAT}`, 'utf8');
// const credentials = { key: privateKey, cert: certificate };

const app = express();

const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

const io = socketIo(httpServer, {
  cors: {
    origin: '*',
  }
});

initSocketIo(io);
initializeChatSocket(io)

app.use(cors());
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
// app.use(session({
//   secret: process.env.SECRETKEY,
//   cookie: { secure: true }
// }));
app.use(bodyParser.json({ limit: '250mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Middleware to add io to req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// router
app.get('/failed', (req, res) => {
  res.send("Failed");
});

app.use("/api/temporary", require('./routes/router-temporary'));
// app.use("/api/temporary/seller", require('./routes/router-temporary-seller'));
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
app.use("/api/vendor", require('./routes/router-vendor/router-vendor'));
app.use("/api/supplier", require('./routes/router-supplier'));
app.use("/api/data/produsen", require('./routes/router-data-produsen'));
app.use("/api/konsumen", require('./routes/router-konsumen/router-konsumen'));
app.use("/api/konsumen/pic", require('./routes/router-konsumen/router-konsumen-pic'));

// router distributtor
app.use("/api/distributor", require('./routes/router-distributtor/router-distributtor'));
app.use('/api/document-penanggungan-jawab', require('./routes/router-distributtor/router-document-penanggungJawab'))
app.use('/api/kendaraan-distributtor', require('./routes/router-distributtor/router-kendaraaanDistributtor'))
app.use('/api/pesanan-distributor', require('./routes/router-distributtor/router-pesananDistributor'))
app.use('/api/jenis-kendaraan', require('./routes/router-distributtor/router-jenis-kendaraan'))
app.use('/api/merk-kendaraan', require('./routes/router-distributtor/router-merk-kendaraan'))
app.use('/api/gudang-distributor', require('./routes/router-distributtor/router-gudang-distributor'))
app.use('/api/pengemudi', require('./routes/router-distributtor/router-pengemudi'))
app.use('/api/jasa-distributor', require('./routes/router-distributtor/router-jenisJasaDistributor'))
app.use('/api/type-kendaraan', require('./routes/router-distributtor/router-typeKendaraan'))
app.use('/api/proses-pengiriman', require('./routes/router-distributtor/router-prosesPengiriman'))
app.use('/api/review-distributor', require('./routes/router-distributtor/router-reviewDistributor'))
app.use('/api/rekening-distributor', require('./routes/router-distributtor/router-rekeningDistributor'))

// review produk
app.use('/api/review-produk', require('./routes/router-review/router-reviewProduk'))
app.use('/api/replay-produk', require('./routes/router-review/router-replayProduk'))

// router Sekolah
app.use('/api/instansi', require('./routes/router-controler-sekolah/router-instansi'))
app.use("/api/konsumen/sekolah", require("./routes/router-konsumen/router-sekolah"))

app.use('/api/payment', require('./routes/router-payment'));
app.use('/api/resend-otp', require('./routes/router-resendOtp'));
app.use('/api/login/google-oauth', require('./routes/router-login-google-oauth'));
app.use('/api/register/google-oauth', require('./routes/router-register-google-oauth'));
app.use('/api/promo', require('./routes/router-promo'));
app.use('/api/minat', require('./routes/router-minat'));
app.use('/api/flash-sale', require('./routes/router-flash-sale'));
app.use('/api/gratong', require('./routes/router-gratong'));
app.use('/api/alamat', require('./routes/router-alamat'));
app.use('/api/sekolah', require('./routes/router-simulasi-sekolah'));
app.use('/api/pangan', require('./routes/router-pangan'));
app.use('/api/invoice', require('./routes/router-invoice'));

// Admin Panel
app.use('/api/user-system', require('./routes/router-system-user'));
app.use('/api/panel', require('./routes/router-adminPanel/router-adminPanel'))
app.use('/api/biaya_tetap', require('./routes/router-biaya-tetap'));
app.use('/api/metode_pembayaran', require('./routes/router-metode-pembayaran'));

// message
app.use('/contak', require('./routes/router-message/router-message'))

app.use('/api/tarif', require('./routes/router-tarif'))

// midelware error
app.use(require("./midelware/error-midelware"));

app.listen(4000, () => {
  // flash_sale_checker.start()
  checker_order()
  batalPesanan()
  console.log("connection express success");
  websocket.listen(5000, () => {
    console.log("Connection websocket success");
  });
});
