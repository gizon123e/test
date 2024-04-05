const User = require('../models/model-auth-user')
module.exports = async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id)
        if(user.role.toLowerCase() == "konsumen"){
            return res.status(403).json({error: true, message: "Konsumen tidak bisa manage produk"})
        }
        next()
    }catch(error){
        next(error)
    }
}