const User = require("../models/model-auth-user");

const sendOTP = require("../utils/sendOtp").sendOtp;
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");

module.exports = {
  register: async (req, res, next) => {
    try {
      const { username, email, password, role, phone } = req.body;

      const isEmailRegister = await User.exists({ email });
      if (isEmailRegister) {
        return res.status(400).json({ error: "email sudah terdaftar" });
      }

      const isPhoneValidate = await User.exists({ phone })
      if (isPhoneValidate) return res.status(400).json({ error: "phone sudah terdaftar" })

      const regexNoTelepon =
        /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
      if (!regexNoTelepon.test(phone))
        return res.status(400).json({ error: "no telepon tidak valid" });

      const handleHashPassword = await bcrypt.hash(password, 10);

      const code_OTP = Math.floor(1000 + Math.random() * 9000);

      const newUser = await User.create({
        username,
        email,
        password: handleHashPassword,
        role,
        phone,
        code_OTP
      })

      const newUserWithoutPassword = { ...newUser._doc };
      delete newUserWithoutPassword.password;
      delete newUserWithoutPassword.code_OTP

      sendOTP(email, code_OTP);

      return res.status(201).json({
        error: false,
        message: "register success",
        datas: newUserWithoutPassword,
      })

    } catch (err) {
      if (err && err.name == "ValidationError") {
        return res.status(400).json({
          error: true,
          message: err.message,
          fields: err.fields,
        });
      }
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password, phone } = req.body;
      let newUser;
      if(email && !phone){
        newUser = await User.findOne({ email });
      }else if(phone && !email){
        newUser = await User.findOne({ phone });
      }else if(phone && email){
        return res.status(400).json({message: "Masukan hanya email atau no hp aja cukup ya kalo untuk login"});
      }

      if(!newUser) return res.status(400).json({message: "Email atau No Hp yang dimasukkan tidak ditemukan"});

      const validationPassword = await bcrypt.compare(
        password,
        newUser.password
      );

      if (!validationPassword) {
        return res.status(400).json({
          error: true,
          message: "invalid email / password",
        });
      };

      const tokenPayload = {
        id: newUser._id,
        name: newUser.username,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      };

      const jwtToken = jwt.createToken(tokenPayload);

      return res.status(200).json({
        error: false,
        message: "login success",
        datas: {
          ...tokenPayload,
          token: jwtToken,
          kode_otp: 1111
        },
      });
    } catch (err) {
      if (err && err.name == "ValidationError") {
        return res.status(400).json({
          error: true,
          message: err.message,
          fields: err.fields,
        });
      }
      next(err);
    }
  },
};
