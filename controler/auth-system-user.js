const User = require("../models/model-auth-user");
const UserSystem = require("../models/model-user-system");
const jwt = require("../utils/jwt")
const bcrypt = require('bcrypt')
module.exports = {
    login: async(req, res, next)=>{
        try {
           const { username, password } = req.body;
           const user = await UserSystem.findOne({username})
           if(!user) return res.status(404).json({message: "User tidak ada"});
           const payloadToken = {
                id: user._id,
                username: user.username,
                role: user.role
           }
           const token = jwt.createToken(payloadToken);
           const validPassword = await bcrypt.compare(password, user.password);
           if(!validPassword) return res.status(401).json({message:"Password Salah"});
           return res.status(200).json({message: "Login Berhasil", token})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllUser: async(req, res, next) =>{
        try {
            // if(req.user.role !== "administrator") return res.status(403).json({message: "Hanya Admin yang boleh akses!"});

            const users = await User.aggregate([
                {
                    $group: {
                        role: "konsumen"
                    }
                }
            ])
            console.log(users);
        } catch (error) {
            next(error)
        }
    }
}