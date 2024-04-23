const jwt = require('../utils/jwt')
const { getToken } = require('../utils/getToken')

module.exports = (req, res, next) => {
    // try {
    //     const token = getToken(req)
    //     if (!token) return res.status(401).json({ error: false, message: 'Token not Found' })

    //     const verifyToken = jwt.verifyToken(token)
    //     if (!verifyToken) return res.status(401).json({ error: false, message: 'authenticate faileds' })

    //     req.user = verifyToken
    //     next()
    // } catch (error) {
    //     console.log(error)
    //     next(error)
    // }
    try {
        const token = getToken(req)
        if (!token) return res.status(401).json({ error: false, message: 'Token not Found' })

        const verifyToken = jwt.verifyToken(token)
        req.user = verifyToken
        next()
    } catch (error) {
        if (error.message === "Token has expired") {
            return res.status(401).json({ error: true, message: 'Token has expired' })
        } else if (error.message === "Invalid Token") {
            return res.status(401).json({ error: true, message: 'Invalid Token' })
        } else {
            console.log(error)
            return res.status(500).json({ error: true, message: 'Token verification failed' })
        }
    }
}