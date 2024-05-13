const User = require("../models/model-auth-user");
const UserSystem = require("../models/model-user-system");
const bcrypt = require('bcrypt')
module.exports = {
    login: async(req, res, next)=>{
        try {
           const { username, password } = req.body;
           const user = await UserSystem.findOne({username})
           if(!user) return res.status(404).json({message: "User tidak ada"});
           
           const validPassword = await bcrypt.compare(password, user.password);
           if(!validPassword) return res.status(401).json({message:"Password Salah"});
           return res.status(200).json({message: "Login Berhasil", token: "Ini Token"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}