const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config()

module.exports = {
    sendOtp: (email, kode, status) => {
        const subject = status === "login" ? "Login Otp Code" : status === "register" ? "Register Otp Code" : "Resend Otp Code";
        const transporter = nodemailer.createTransport({
            host: "s1315.sgp1.mysecurecloudhost.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_PASS
            },
        });

        return transporter.sendMail({
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: subject,
            text: `KODE OTP :  ${kode} berlaku selama 5 menit. RAHASIAKAN KODE OTP Anda! Jangan beritahukan kepada SIAPAPUN!`,
        })
    },

    sendOtpPhone: async (nomor, content) => {
        try {
            const splittedNomor = nomor.split('08');
            console.log(splittedNomor)
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