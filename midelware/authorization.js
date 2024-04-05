<<<<<<< HEAD
const jwt = require('../utils/jwt')
const { getToken } = require('../utils/getToken')

module.exports = (req, res, next) => {
    try {
        const token = getToken(req)
        if (!token) return res.status(401).json({ error: false, message: 'Token not Found' })

        const verifyToken = jwt.verifyToken(token)
        if (!verifyToken) return res.status(401).json({ error: false, message: 'authenticate faileds' })

        req.user = verifyToken
        next()
    } catch (error) {
        console.log(error)
        next(error)
    }
}
=======
const jwt = require('../utils/jwt')
const { getToken } = require('../utils/getToken')

module.exports = (req, res, next) => {
    try {
        const token = getToken(req)
        if (!token) return res.status(401).json({ error: false, message: 'Token not Found' })

        const verifyToken = jwt.verifyToken(token)
        if (!verifyToken) return res.status(401).json({ error: false, message: 'authenticate faileds' })

        req.user = verifyToken
        next()
    } catch (error) {
        console.log(error)
        next(error)
    }
}
>>>>>>> b5a31a26557174393446f828752b57d536e79998
