module.exports = (err, req, res, next) => {
    const validateError = {
        error: true,
        method: req.method,
        url: req.url
    }
    console.log(err)
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ ...validateError, message: 'Authentication failed' })

    if (err.code && err.message) return res.status(err.code).json({ ...validateError, message: err.message })

    if(err=="Error: Invalid Token") return res.status(403).json({ ...validateError, message: "Token Invalid" })

    res.status(500).json({ ...validateError, message: 'internal server error', error: err.errors })
}