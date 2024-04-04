module.exports = (err, req, res, next) => {
    console.log(err.name)

    const validateError = {
        error: true,
        method: req.method,
        url: req.url
    }

    if (err.name === 'JsonWebTokenError') return res.status(401).json({ ...validateError, message: 'Authentication failed' })

    if (err.code && err.message) return res.status(err.code).json({ ...validateError, message: err.message })

    res.status(500).json({ ...validateError, message: 'internal server error', error: err.errors })
}