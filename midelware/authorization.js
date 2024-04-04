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
        next(error)
    }
}