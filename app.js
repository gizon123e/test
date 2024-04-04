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
app.use('/', require('./routes/router-index'))
app.use('/product', require('./routes/router-product'))

// midelware error
app.use(require('./midelware/error-midelware'))

app.listen(4000, () => console.log('connection express success'))
