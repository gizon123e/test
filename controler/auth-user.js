const User = require("../models/model-auth-user");
const sendOTP = require("../utils/sendOtp").sendOtp;
const bcrypt = require("bcrypt");

module.exports = {

  sendOtpWithEmail: async (req, res, next) =>{
    try {
      const { email } = req.body;

      if(!email) return res.status(400).json({message:"Tidak ada email yang dikirimkan"});

      const isEmailRegister = await User.exists({ 'email.content': email });

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
        'email.content': email,
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
      const isPhoneRegistered = await User.exists({ 'phone.content': phone });
      
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
        'phone.content': phone,
        codeOtp
      });

      // function sendOTP with phone

      return res.status(200).json({message: "SMS Verifikasi Sudah dikirim", id: newUser._id, kode_otp: kode_random});

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  register: async (req, res, next) => {
    try {
      const { id, password, role, pin } = req.body;
      if(!id) return res.status(400).json({message: "Tidak ada id yang dikirim"});
      const user = await User.findById(id);
      if(!user.phone.isVerified && !user.email.isVerified) return res.status(403).json({message: "User belum terverifikasi"});
      let data = {}
      // const regexNoTelepon =
      //   /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
      // if (!regexNoTelepon.test(phone))
      //   return res.status(400).json({ error: "no telepon tidak valid" });
      if(password && !pin){
        if(!user.email.content) return res.status(400).json({message: "Mungkin user register dengan no hp, no hp membutuhkan pin"})
        if(password.trim().length < 4) return res.status(400).json({message: "Password harus lebih dari 4 karakter"});
        const handleHashPassword = await bcrypt.hash(password, 10);
        data = {
          role,
          password: handleHashPassword
        }
      }else if(pin && !password){
        if(!user.phone.content) return res.status(400).json({message: "Mungkin user register dengan email, email membutuhkan password"})
        const handleHashPin = await bcrypt.hash(pin, 10);
        data = {
          role,
          pin: handleHashPin
        }
      }else{
        return res.status(400).json({message: "Error Request, ada pin dan password dalam body request"})
      };

      
      const newUser = await User.findByIdAndUpdate(id, data, {new: true});
      
      if(!newUser) return res.status(404).json({message: `id ${id} tidak ditemukan`});
      const newUserWithoutPassword = { ...newUser._doc };
      delete newUserWithoutPassword.password;
      delete newUserWithoutPassword.codeOtp;
      delete newUserWithoutPassword.pin

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
      console.log(err)
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password, phone, pin } = req.body;
      let newUser;

      if(email && !phone){
        newUser = await User.findOne({ 'email.content': email });
      }else if(phone && !email){
        const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
        if (!regexNoTelepon.test(phone)) return res.status(400).json({ message: "no telepon tidak valid" });
        newUser = await User.findOne({ 'phone.content': phone });
      }else if(phone && email){
        return res.status(400).json({message: "Masukan hanya email atau no hp aja cukup ya kalo untuk login"});
      }
      
      if(!newUser) return res.status(404).json({message: "Email atau No Hp yang dimasukkan tidak ditemukan"});

      if(email && !newUser.email.isVerified && !phone) return res.status(403).json({message: "Email Belum diverifikasi", verification: false});

      if(phone && !newUser.phone.isVerified && !email) return res.status(403).json({message: "No Hp Belum diverifikasi", verification: false});

      if(email && !phone){
        if(!password || password.trim().length < 4) return res.status(400).json({message: "Password Kosong atau kurang dari 4", error: true})
        const validationPassword = await bcrypt.compare(
          password,
          newUser.password
        );

        if (!validationPassword) {
          return res.status(401).json({
            error: true,
            message: "invalid password",
          });
        };

      }else if(!email && phone){
        if(!pin || pin.trim().length < 6) return res.status(400).json({message: "pin kosong atau kurang dari 6", error: true});
        const validationPin = await bcrypt.compare(
          pin,
          newUser.pin
        )
        if (!validationPin) {
          return res.status(401).json({
            error: true,
            message: "invalid Pin",
          });
        };
      }

      const kode_random = Math.floor(1000 + Math.random() * 9000);
      const kode = await bcrypt.hash(kode_random.toString(), 3);
      
      const codeOtp = {
        code: kode,
        expire: new Date(new Date().getTime() + 5 * 60 * 1000)
      };

      const kode_otp = phone? kode_random : null
      newUser.codeOtp = codeOtp
      await newUser.save();

      if(email && !phone) sendOTP(email, kode_random, "login");

      return res.status(200).json({
        error: false,
        message: `${phone? "SMS" : "Email"} verifikasi sudah dikirim!`,
        id: newUser._id,
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
  
  successLoginWithEmail: async(req, res, next) =>{
    try {
      const user = await User.findOne({'email.content': req.user.email});
      if(!user) return res.status(404).json({message:`Email ${req.user.email} belum terdaftar`});

      if(req.user.googleId) return res.status(200).json( { message: "Berhasil Login", data: {
        ...req.user,
        token
      }});
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  successRegisterWithEmail: async (req, res, next) =>{
    try {
      const registeredUser = await User.exists({'email.content': req.user.email});
      if(registeredUser) return res.status(403).json({message: "Email Sudah Terdaftar"});

      const newUser = await User.create({
        'email.content': req.user.email,
      });

      return res.status(201).json({message: "Email Sudah Berhasil Terdaftar", data: newUser});
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
};
