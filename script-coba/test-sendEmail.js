const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      clientId: "676606000420-sjnq6smdbfhq8f8sjv2au6nrau8s3pbh.apps.googleusercontent.com",
      clientSecret: "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",
    },
});

transporter.sendMail({
    from: "superappsdigital@gmail.com",
    to: "muhammadnurfisyalt@gmail.com",
    subject: "OTP Registration",
    text: "Ini kode otp: 1532",
    auth: {
      user: "superappsdigital@gmail.com",
      refreshToken: "1//04mrOhw27siHHCgYIARAAGAQSNwF-L9IrL2_igSyOPBehoogDKnnZx7RQdVirTyh_Qs1Op7MzOe-xvKCwkFxc8czYtQJfFDqAPzc",
      accessToken: "ya29.a0AXooCgs4oD-a-nMtHCC-dp538_DSZ7XBtsJZsTwIltRVOei_T_cSVzDMghRXsXmwQ3x-Dg6JsxlOTBizuKBFsGLj1YulGpgK1Mwu9231obxeXHQBOAOVUPg8DQYKjGeME3lFa5Sd5oL_SH2Vv9ItymmySwV9bSMDzN6FaCgYKAbkSARMSFQHGX2MiwaMazw4biFCN5pTyrZlzIA0171",
      expires: 1484314697598,
    },
}).then(()=>{
    console.log('Email sudah terkirim')
})