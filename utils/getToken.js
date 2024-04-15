const jwt = require('./jwt')

module.exports = {
    getToken: (req) => {
        const token = req.headers.authorization ? req.headers.authorization : null

        return token? token : null
    }
}