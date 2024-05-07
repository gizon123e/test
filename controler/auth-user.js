const User = require("../models/model-auth-user");
const sendOTP = require("../utils/sendOtp").sendOtp;
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");

module.exports = {

  sendOtpWithEmail: async (req, res, next) =>{
    try {
      const { email } = req.body;

      if(!email) return res.status(400).json({message:"Tidak ada email yang dikirimkan"});

      const isEmailRegister = await User.exists({ email });

      if (isEmailRegister) {
        return res.status(400).json({ error: "email sudah terdaftar" });
      };

      const kode_random = Math.floor(1000 + Math.random() * 9000);
      const kode = await bcrypt.hash(kode_random.toString(), 3);

      const codeOtp = {
        code: kode,
        expire: new Date(new Date().getTime() + 5 * 60 * 1000)
      };

      const newUser = await User.create({
        email,
        codeOtp
      });

      sendOTP(email, kode_random, "register");

      return res.status(200).json({message: "Email Verifikasi Sudah dikirim", id: newUser._id});

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  sendOtpWithPhone: async (req, res, next) =>{
    try {
      const { phone } = req.body;
      if(!phone) return res.status(400).json({message:"Tidak ada phone number yang dikirimkan"});
      const isPhoneRegistered = await User.exists({ phone });

      if (isPhoneRegistered) {
        return res.status(400).json({ error: "phone sudah terdaftar" });
      };

      const kode_random = Math.floor(1000 + Math.random() * 9000);
      const kode = await bcrypt.hash(kode_random.toString(), 3);

      const codeOtp = {
        code: kode,
        expire: new Date(new Date().getTime() + 5 * 60 * 1000)
      };

      const newUser = await User.create({
        phone,
        codeOtp
      });

      // sendOTP(email, kode_random, "register");

      return res.status(200).json({message: "SMS Verifikasi Sudah dikirim", id: newUser._id, kode_otp: kode_random});

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  register: async (req, res, next) => {
    try {
      const { id, username, password, role } = req.body;
      if(!id) return res.status(400).json({message: "Tidak ada id yang dikirim"});
      // const regexNoTelepon =
      //   /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
      // if (!regexNoTelepon.test(phone))
      //   return res.status(400).json({ error: "no telepon tidak valid" });

      const handleHashPassword = await bcrypt.hash(password, 10);

      
      const newUser = await User.findByIdAndUpdate(id, {
        username,
        role,
        password: handleHashPassword
      }, {new: true});
      
      if(!newUser) return res.status(404).json({message: `id ${id} tidak ditemukan`});
      if(!newUser.verifikasi) return res.status(403).json({message: "User belum terverifikasi"});
      const newUserWithoutPassword = { ...newUser._doc };
      delete newUserWithoutPassword.password;
      delete newUserWithoutPassword.codeOtp;

      return res.status(201).json({
        error: false,
        message: "register success",
        datas: newUserWithoutPassword,
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

  login: async (req, res, next) => {
    try {
      const { email, password, phone } = req.body;
      let user;
      if(!password) return res.status(400).json({message:"password tidak boleh kosong"});
      if(email && !phone){
        user = await User.findOne({ email });
      }else if(phone && !email){
        user = await User.findOne({ phone });
      }else if(phone && email){
        return res.status(400).json({message: "Masukan hanya email atau no hp aja cukup ya kalo untuk login"});
      }

      if(!user) return res.status(400).json({message: "Email atau No Hp yang dimasukkan tidak ditemukan"});

      const validationPassword = await bcrypt.compare(
        password,
        user.password
      );

      if (!validationPassword) {
        return res.status(400).json({
          error: true,
          message: "invalid password",
        });
      };

      const kode_random = Math.floor(1000 + Math.random() * 9000);
      const kode = await bcrypt.hash(kode_random.toString(), 3);
      
      const codeOtp = {
        code: kode,
        expire: new Date(new Date().getTime() + 5 * 60 * 1000)
      };

      const kode_otp = phone? kode_random : null
      user.codeOtp = codeOtp
      await user.save();

      if(email && !phone) sendOTP(email, kode_random, "login");


      return res.status(200).json({
        error: false,
        message: `${phone? "SMS":"Email"} Verifikasi Sudah dikirim`,
        id: 
        kode_otp
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
