require("./database/database");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const websocket = require("./websocket/index-ws");
const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// router
app.use('/user', require('./routes/router-user'))
app.use('/product', require('./routes/router-product'))
app.use('/category', require('./routes/router-category'))
app.use('/cart', require('./routes/router-carts'))
app.use('/address', require('./routes/router-address'))
app.use('/order', require('./routes/router-order'))
app.use("/report", require("./routes/router-laporan"));

// midelware error
app.use(require("./midelware/error-midelware"));

app.listen(4000, () => {
  console.log("connection express success");
  websocket.listen(3000, () => {
    console.log("Connection websocket success");
  });
});
