const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config()

module.exports = {

    //PRODUCTION OTP SEND

    sendOtp: (email, kode, status) => {
        const subject = 
        status === "login" ? "Login Otp Code" : 
        status === "register" ? "Register Otp Code" : 
        status === "lupa_password" ? "Forgot Password Otp Code" :
        status === "lupa_pin" ? "Forgot Pin Otp Code" :
        "Send Otp Code"
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SENDER_EMAIL_PROD,
                pass: process.env.PASSWORD_EMAIL_PROD,
            },
        });

        return transporter.sendMail({
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: subject,
            text: `KODE OTP MBG:  ${kode} berlaku selama 5 menit. RAHASIAKAN KODE OTP MBG Anda! Jangan beritahukan kepada SIAPAPUN!`,
        })
    },

    // sendOtp: (email, kode, status) => {
    //     const subject = 
    //     status === "login" ? "Login Otp Code" : 
    //     status === "register" ? "Register Otp Code" : 
    //     status === "lupa_password" ? "Forgot Password Otp Code" :
    //     status === "lupa_pin" ? "Forgot Pin Otp Code" :
    //     "Send Otp Code"
    //     const transporter = nodemailer.createTransport({
    //         host: "smtp.gmail.com",
    //         port: 465,
    //         secure: true,
    //         auth: {
    //             type: "OAuth2",
    //             user: process.env.EMAIL_SENDER,
    //             clientId: process.env.CLIENT_ID,
    //             clientSecret: process.env.CLIENT_SECRET,
    //         },
    //     });

    //     return transporter.sendMail({
    //         from: process.env.EMAIL_SENDER,
    //         to: email,
    //         subject: subject,
    //         text: `KODE OTP MBG:  ${kode} berlaku selama 5 menit. RAHASIAKAN KODE OTP MBG Anda! Jangan beritahukan kepada SIAPAPUN!`,
    //         auth: {
    //             user: process.env.EMAIL_SENDER,
    //             refreshToken: process.env.REFRESH_TOKEN,
    //             accessToken: process.env.ACCESS_TOKEN,
    //             expires: 1484314697598,
    //         },

    //     })
    // },

    sendOtpPhone: async (nomor, content) => {
        try {
            const splittedNomor = nomor.split('08');
            const params = {
                from: "KBI",
                to: `628${splittedNomor[1]}`,
                text: content
            }
            const res = await fetch(`${process.env.URL_SEND_PHONE_OTP}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `${process.env.API_KEY_SEND_OTP}`
                },
                body: JSON.stringify(params)
            })
            const hasil = await res.json()

            return hasil
        } catch (error) {
            console.log(error);
        }
    }
}