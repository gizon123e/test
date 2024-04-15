require('./database/database')
const express = require("express");
const cors = require("cors");
const logger = require('morgan')
const cookieParser = require('cookie-parser')

const app = express();

app.use(cors());
app.use(logger('dev'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// router
app.use('/user', require('./routes/router-user'))
app.use('/product', require('./routes/router-product'))
app.use('/category', require('./routes/router-category'))
app.use('/cart', require('./routes/router-carts'))
app.use('/address', require('./routes/router-address'))
app.use('/order', require('./routes/router-order'))

// midelware error
app.use(require('./midelware/error-midelware'))

app.listen(4000, () => console.log('connection express success'))
