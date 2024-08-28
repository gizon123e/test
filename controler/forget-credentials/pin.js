const crypto = require('crypto');
const User = require('../../models/model-auth-user');
const sendOtp = require("../../utils/sendOtp");
const bcrypt = require("bcrypt")
const generateToken = () => crypto.randomBytes(32).toString('hex');
            
module.exports = {
    
    forgot_pin: async(req, res, next) => {
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
            }else if(!noHp && email){
                filter = {
                    'email.content': email
                }
            }
            const user = await User.exists(filter)
            if(!user) return res.status(404).json({message: "User tidak ditemukan"})
            if(noHp && !email){
                await sendOtp.sendOtpPhone(noHp, `KODE OTP LUPA PIN :  ${kode_random} berlaku selama 5 menit. RAHASIAKAN KODE OTP Anda! Jangan beritahukan kepada SIAPAPUN!`)
            }else if(!noHp && email){
                await sendOtp.sendOtp(email, kode_random, "lupa_pin")
            }
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
                console.log("Berhasil Updte User Lupa Pin", user)
            });

            return res.status(200).json({message: "Berhasil Request Lupa Pin", token: value_token, id: user._id})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}