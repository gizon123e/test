<<<<<<< HEAD
const jwt = require('./jwt')

module.exports = {
    getToken: (req) => {
        const token = req.headers.authorization ? req.headers.authorization : null

        return token? token : null
    }
=======
const jwt = require('./jwt')

module.exports = {
    getToken: (req) => {
        const token = req.headers.authorization ? req.headers.authorization : null

        return token? token : null
    }
>>>>>>> b5a31a26557174393446f828752b57d536e79998
}