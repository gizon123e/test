const User = require('../models/model-auth-user')
module.exports = async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id)
        if(user.role.toLowerCase() == "distributor"){
            return res.status(403).json({error: true, message: "Distributor tidak bisa upload produk"})
        }
        next()
    }catch(error){
        next(error)
    }
}