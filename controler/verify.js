const User = require("../models/model-auth-user");
const { TemporaryUser } = require('../models/model-temporary-user');
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");

module.exports = {
    verifyOtpRegister: async (req, res, next) =>{
        try {
            const { kode_otp, id } = req.body;
            const { type } = req.query
            const user = await TemporaryUser.findById(id);
            if(!user) return res.status(400).json({message:"User tidak ditemukan"});
            if(new Date().getTime() > user.codeOtp.expire.getTime() ) return res.status(401).json({message: "Kode sudah tidak valid"});
            const kode = await bcrypt.compare(kode_otp.toString(), user.codeOtp.code);
            if(!kode) return res.status(401).json({message: "Kode OTP Tidak Sesuai"});
            await TemporaryUser.findByIdAndUpdate(id, {verifikasi: true});
            if(type === "email"){
                if(!user.email.content) return res.status(400).json({message:"User tidak daftar dengan email"})
                if(user.email.isVerified) return res.status(400).json({message: "User sudah terverifikasi"});
                await TemporaryUser.findByIdAndUpdate(id, {'email.isVerified': true})
            }else if(type === "phone"){
                if(!user.phone.content) return res.status(400).json({message:"User tidak daftar dengan phone"})
                if(user.phone.isVerified) return res.status(400).json({message: "User sudah terverifikasi"});
                await TemporaryUser.findByIdAndUpdate(id, {'phone.isVerified': true})
            }
            return res.status(200).json({message: "Verifikasi Berhasil"});
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    verifyOtpLogin: async (req, res, next ) =>{
        try {
            const { kode_otp, id } = req.body;
            
            let user = await User.findById(id);
            if(!user) return res.status(400).json({message:"User tidak ditemukan"});
            
            if(new Date().getTime() > user.codeOtp.expire.getTime() ) return res.status(401).json({message: "Kode sudah tidak valid"});
            const kode = await bcrypt.compare(kode_otp.toString(), user.codeOtp.code);
            if(!kode) return res.status(401).json({message: "Kode OTP Tidak Sesuai"});

            const tokenPayload = {
                id: user._id,
                email: user.email,
                phone: user.phone,
                role: user.role,
            };
            
            const jwtToken = jwt.createToken(tokenPayload);

            return res.status(200).json({message: "Verifikasi Berhasil", data: {
                ...tokenPayload, 
                token: jwtToken
            }
            });
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    verifyResetCredentials: async(req, res, next) => {
        try {
            const { token_reset, id, kode_otp } = req.body
            if(!token_reset || !id ) return res.status(400).json({message: "kirimkan body token_reset dan id!"})
            const user = await User.findOne({_id: id, 'token.value': token_reset}).select("token");
            if(!user) return res.status(404).json({message: "Tidak Ditemukan"});
            if(user.codeOtp.expire < new Date() || user.token.expired < new Date()) return res.status(401).json({message: "Sudah Kadaluarsa"});
            const kode = await bcrypt.compare(kode_otp.toString(), user.codeOtp.code);
            if(!kode) return res.status(401).json({message: "Kode OTP Tidak Sesuai"});
            User.findByIdAndUpdate(user._id, {
                'token.verified': true
            })
            .then(()=>console.log("berhasil update"))
            .catch((e)=> console.log('error: ', e))
            return res.status(200).json({message: "User Terverifikasi"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}