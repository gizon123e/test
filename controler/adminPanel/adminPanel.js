const bcrypt = require('bcrypt')
const jwt = require('../../utils/jwt')
const User_System = require('../../models/model-user-system')

// controler Virtual Acunt
const VirtualAccountUser = require('../../models/model-user-va')

module.exports = {
    register: async (req, res, next) => {
        try {
            const { email, role, password } = req.body

            const user = await User_System.findOne({ email })
            console.log(user)
            if (user) return res.status(400).json({ message: `name ${email} sudah register` })

            const dataPassword = await bcrypt.hash(password, 10)

            const data = await User_System.create({ email, role, password: dataPassword })

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
            const { email, password } = req.body

            const user = await User_System.findOne({ email })
            if (!user) return res.status(400).json({ message: `name ${email} belom register` })

            const validatePassword = await bcrypt.compare(password, user.password)
            if (!validatePassword) return res.status(400).json({ message: "Username / Password incored" })

            const tokenPayload = {
                id: user._id,
                email: user.email,
                password: user.password,
                role: user.role,
            };

            const token = jwt.createToken(tokenPayload)

            res.status(201).json({
                message: "Login Success",
                data: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    token
                }
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    userDetailId: async (req, res, next) => {
        try {
            const dataDetailId = await VirtualAccountUser.findOne({ userId: req.params.id }).populate("userId").populate("nama_bank")
            if (!dataDetailId) {
                return res.status(404).json({ message: "data Not Found" })
            }

            res.status(200).json({
                message: "get detail success",
                datas: dataDetailId
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}