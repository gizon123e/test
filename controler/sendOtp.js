const User = require('../models/model-auth-user');
const sendOTP = require("../utils/sendOtp").sendOtp;
const bcrypt = require("bcrypt")

module.exports = {
    sendOtp: async (req, res, next) => {
        const { phone, email } = req.body
        let user;
        if(phone && !email){
            user = await User.findOne({'phone.content': phone});
            if(!user) return res.status(404).json({message: `${phone} belum terdaftar`});
            const kode_random = Math.floor(1000 + Math.random() * 9000);
            const kode = await bcrypt.hash(kode_random.toString(), 3);

            const codeOtp = {
                code: kode,
                expire: new Date(new Date().getTime() + 5 * 60 * 1000)
            };
            user.codeOtp = codeOtp;
            await user.save();
            return res.status(200).json({message: "SMS Verifikasi Sudah Dikirim", kode_otp: kode_random, id: user._id})
        }else if(!phone && email){
            user = await User.findOne({'email.content': email});
            if(!user) return res.status(404).json({message: `${email} belum terdaftar`});

            const kode_random = Math.floor(1000 + Math.random() * 9000);
            const kode = await bcrypt.hash(kode_random.toString(), 3);

            const codeOtp = {
                code: kode,
                expire: new Date(new Date().getTime() + 5 * 60 * 1000)
            };

            user.codeOtp = codeOtp
            await user.save()
            sendOTP(email, kode_random, "resend")
            return res.status(200).json({message: "Email Verifikasi Sudah Dikirim", id: user._id});
        }
    }
}