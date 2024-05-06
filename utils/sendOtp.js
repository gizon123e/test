const nodemailer = require("nodemailer");
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    sendOtp: (email, kode) => {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              type: "OAuth2",
              clientId: process.env.CLIENT_ID,
              clientSecret: process.env.CLIENT_SECRET,
            },
        });
        
        transporter.sendMail({
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: "Registration OTP Code",
            text: "Ini kode otp: " + kode,
            auth: {
              user: process.env.EMAIL_SENDER,
              refreshToken: process.env.REFRESH_TOKEN,
              accessToken: process.env.ACCESS_TOKEN,
              expires: 1484314697598,
            },
        }).then(()=>{
            console.log('Email sudah terkirim')
        })
    }
}