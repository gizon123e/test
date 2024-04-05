<<<<<<< HEAD
const jwt = require('jsonwebtoken')

const config = require('../config/config-env')

module.exports = {
    createToken: (token) => {
        return jwt.sign(token, config.secretKey, { expiresIn: '24h' })
    },
    verifyToken: (token) => {
        try {
            return jwt.verify(token, config.secretKey)
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired')
            } else {
                throw new Error('Invalid Token')
            }
        }
    }
=======
const jwt = require('jsonwebtoken')

const config = require('../config/config-env')

module.exports = {
    createToken: (token) => {
        return jwt.sign(token, config.secretKey, { expiresIn: '24h' })
    },
    verifyToken: (token) => {
        try {
            return jwt.verify(token, config.secretKey)
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired')
            } else {
                throw new Error('Invalid Token')
            }
        }
    }
>>>>>>> b5a31a26557174393446f828752b57d536e79998
}