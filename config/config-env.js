const dotenv = require('dotenv');

dotenv.config()

module.exports = {
    secretKey: process.env.SECRETKEY,
}