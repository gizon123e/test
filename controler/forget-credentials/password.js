const crypto = require('crypto');
const User = require('../../models/model-auth-user');
const sendOtp = require("../../utils/sendOtp");
const bcrypt = require("bcrypt")
const generateToken = () => crypto.randomBytes(32).toString('hex');
            
module.exports = {
    
    forgot_password: async(req, res, next) => {
        try {
            const { noHp, email } = req.body;
            let filter
            if(!noHp && !email)return res.status(400).json({message: "harus mengirimkan body noHp atau email!"});
            const kode_random = Math.floor(1000 + Math.random() * 9000);
            const kode = await bcrypt.hash(kode_random.toString(), 3);
            const codeOtp = {
                code: kode,
                expire: new Date(new Date().getTime() + 5 * 60 * 1000)
            };

            if(noHp && !email){
                filter = {
                    'phone.content': noHp
                }
                await sendOtp.sendOtpPhone(noHp, `KODE OTP LUPA PASSWORD :  ${kode_random} berlaku selama 5 menit. RAHASIAKAN KODE OTP Anda! Jangan beritahukan kepada SIAPAPUN!`)
            }else if(!noHp && email){
                filter = {
                    'email.content': email
                }
                await sendOtp.sendOtp(email, kode_random, "lupa_password")
            }
            const user = await User.exists(filter)
            const value_token = generateToken();
            User.findOneAndUpdate(
                filter,
                {
                    token: {
                        value: value_token,
                        expired: new Date(new Date().getTime() + 5 * 60 * 1000)
                    },
                    codeOtp
                },
                { new: true }
            )
            .then((user)=>{
                console.log("Berhasil Updte User Lupa Password", user)
            });

            return res.status(200).json({message: "Berhasil Request Lupa Password", token: value_token, id: user._id})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}