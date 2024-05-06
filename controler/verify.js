const User = require("../models/model-auth-user");
module.exports = {
    verifyOtpRegister: async (req, res, next) =>{
        try {
            const { kode_otp, id } = req.body
            const user = await User.findById(id);
            if(kode_otp.toString() == user.code_OTP){
                await user.updateOne({verifikasi: true});
                res.status(200).json({message: "Berhasil terverikasi"});
            }else{
                res.status(403).json({message: "Kode OTP Salah"});
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    verifyOtpLogin: async (req, res, next ) =>{
        try {
            const { kode_otp } = req.body;
            console.log(kode_otp)
            if(kode_otp === "1111"){
                return res.status(200).json({message: "Berhasil terverifikasi"});
            }else{
                return res.status(403).json({message: "Gagal terverifikasi"});
            }
        } catch (error) {
            
        }
    }
}