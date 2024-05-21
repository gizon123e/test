const UserAdminPanel = require('../../models/user-admin-panel/usert-panel')
const bcrypt = require('bcrypt')
const jwt = require('../../utils/jwt')

module.exports = {
    register: async (req, res, next) => {
        try {
            const { username, role, password } = req.body

            const user = await UserAdminPanel.findOne({ username })
            console.log(user)
            if (user) return res.status(400).json({ message: `name ${username} sudah register` })

            const dataPassword = await bcrypt.hash(password, 10)

            const data = await UserAdminPanel.create({ username, role, password: dataPassword })

            res.status(201).json({
                message: 'Register Success',
                data
            })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    login: async (req, res, next) => {
        try {
            const { username, password } = req.body

            const user = await UserAdminPanel.findOne({ username })
            if (!user) return res.status(400).json({ message: `name ${username} belom register` })

            const validatePassword = await bcrypt.compare(password, user.password)
            if (!validatePassword) return res.status(400).json({ message: "Username / Password incored" })

            const tokenPayload = {
                id: user._id,
                username: user.username,
                password: user.password,
                role: user.role,
            };

            const token = jwt.createToken(tokenPayload)

            res.status(201).json({
                message: "Login Success",
                data: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    token
                }
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}