const User = require('../models/model-auth-user')

const bcrypt = require('bcrypt')
const jwt = require('../utils/jwt')

module.exports = {
    register: async (req, res, next) => {
        try {
            const { username, email, password, role } = req.body
            const isEmailRegister = await User.exists({ email })
            if (isEmailRegister) {
                return res.status(400).json({ error: 'email sudah terdaftar' })
            }

            const handleHashPassword = await bcrypt.hash(password, 10)

            const newUser = await User.create({ username, email, password: handleHashPassword, role })

            return res.status(201).json({
                error: false,
                message: 'register success',
                datas: newUser
            })
        } catch (err) {
            if (err && err.name == 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: err.message,
                    fields: err.fields
                })
            }
            next(err)
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body
            const newUser = await User.findOne({ email })
            if (!newUser) {
                return res.status(400).json({
                    error: true,
                    message: 'invalid email / password'
                })
            }

            const validationPassword = await bcrypt.compare(password, newUser.password)
            if (!validationPassword) {
                return res.status(400).json({
                    error: true,
                    message: 'invalid email / password'
                })
            }

            const tokenPayload = {
                id: newUser._id,
                name: newUser.username,
                email: newUser.email,
                role: newUser.role
            }

            const jwtToken = jwt.createToken(tokenPayload)

            res.status(201).json({
                error: false,
                message: 'login success',
                datas: {
                    name: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    token: jwtToken
                }
            })
        } catch (err) {
            if (err && err.name == 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: err.message,
                    fields: err.fields
                })
            }
            next(err)
        }
    }
}