const User = require("../models/model-auth-user");
const sendOTP = require("../utils/sendOtp").sendOtp;
const sendPhoneOTP = require('../utils/sendOtp').sendOtpPhone
const jwt = require("../utils/jwt");
const bcrypt = require("bcrypt");

module.exports = {

  sendOtpWithEmail: async (req, res, next) =>{
    try {
      const { email } = req.body;

      if(!email) return res.status(400).json({message:"Tidak ada email yang dikirimkan"});

      const isEmailRegister = await User.exists({ 'email.content': email });

      if (isEmailRegister) {
        return res.status(400).json({ message: "email sudah terdaftar" });
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
        return res.status(400).json({ message: "phone sudah terdaftar" });
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

      sendPhoneOTP(phone, `KODE OTP :  ${kode_random} berlaku selama 5 menit. RAHASIAKAN KODE OTP Anda! Jangan beritahukan kepada SIAPAPUN!`)

      return res.status(200).json({message: "SMS Verifikasi Sudah dikirim", id: newUser._id });

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  register: async (req, res, next) => {
    try {
      const { id, password, role } = req.body;
      if(!id) return res.status(400).json({message: "Tidak ada id yang dikirim"});
      const user = await User.findById(id);
      if(!user.phone.isVerified && !user.email.isVerified) return res.status(403).json({message: "User belum terverifikasi"});
      let data = {}
      if(password){
        const handleHashPassword = await bcrypt.hash(password, 10);
        data = {
          role,
          password: handleHashPassword
        }
      }else{
        data = {
          role
        }
      }

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
        if(!newUser) return res.status(404).json({message: "Email yang dimasukkan tidak ditemukan"});
      }else if(phone && !email){
        const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
        if (!regexNoTelepon.test(phone)) return res.status(400).json({ message: "no telepon tidak valid" });
        newUser = await User.findOne({ 'phone.content': phone });
        if(!newUser) return res.status(404).json({message: "No Hp yang dimasukkan tidak ditemukan"});
      }else if(phone && email){
        return res.status(400).json({message: "Masukan hanya email atau no hp aja cukup ya kalo untuk login"});
      }

      if(email && !newUser.email.isVerified && !phone) return res.status(403).json({message: "Email Belum diverifikasi", verified: false});

      if(!phone && email && password){
        if(!newUser.password) return res.status(404).json({message:"User belum memiliki password"});
        const validPassword = await bcrypt.compare(
          password,
          newUser.password
        );

        if(!validPassword) return res.status(401).json({message:"Invalid Password"});
        
      }else if(!email && phone && pin){
        if(!newUser.phone.isVerified) return res.status(403).json({message: "No Hp belum diverifikasi"});
        if(!newUser.pin) return res.status(404).json({message:"User belum memiliki pin"});
        const validPin = await bcrypt.compare(
          pin,
          newUser.pin
        );
        
        if(!validPin) return res.status(401).json({message: "Invalid Pin"});
      }

      const kode_random = Math.floor(1000 + Math.random() * 9000);
      const kode = await bcrypt.hash(kode_random.toString(), 3);
      
      const codeOtp = {
        code: kode,
        expire: new Date(new Date().getTime() + 5 * 60 * 1000)
      };

      newUser.codeOtp = codeOtp;
      await newUser.save();

      if(email && !phone){ 
        sendOTP(email, kode_random, "login")
      }else if(!email && phone) {
        console.log('masuk')
        sendPhoneOTP(phone, `KODE OTP :  ${kode_random} berlaku selama 5 menit. RAHASIAKAN KODE OTP Anda! Jangan beritahukan kepada SIAPAPUN!`)
      }
      

      return res.status(200).json({
        error: false,
        message: `${phone? "Phone" : "Email"} verifikasi sudah dikirim!`,
        id: newUser._id,
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

  addPin: async(req, res, next) =>{
    try {
      const { pin } = req.body;
      const user = await User.findById(req.user.id);
      if(user.pin) return res.status(403).json({message: "User sudah memiliki pin"});
      const hashedPin = await bcrypt.hash(pin, 10);
      user.pin = hashedPin;
      await user.save();
      return res.status(201).json({message: "Berhasil Menambahkan Pin"});
    } catch (error) {
      console.log(error);
      next(error)
    };
  },

  verifyPin: async(req, res, next) =>{
    try {
      const { pin } = req.body
      if(!pin || pin.trim().length === 0) return res.status(400).json({message: "Pin Kosong"})
      const user = await User.findById(req.user.id);
      const validatePin = await bcrypt.compare(
        pin,
        user.pin
      );
      if(!validatePin) return res.status(401).json({message: "Pin Salah"});
      const pinToken = {
        userId: req.user.id,
        pin: pin
      }

      const token = jwt.createToken(pinToken)
      return res.status(200).json({message: "Pin Benar", token});
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  editPin: async(req, res, next) =>{
    try {
      const { pin, token } = req.body;
      if(!pin || pin.trim().length === 0) return res.status(400).json({message: "Pin Kosong"});
      const hashedPin =  await bcrypt.hash(pin, 10);
      const verifyToken = jwt.verifyToken(token);

      if(!verifyToken) return res.status(401).json({message: "Token Salah"});
      if(verifyToken.userId !== req.user.id) return res.status(403).json({message: "Tidak Bisa Mengubah Pin Orang Lain"});

      await User.findByIdAndUpdate(req.user.id, {
        pin: hashedPin
      });
      
      return res.status(201).json({message: "Berhasil Mengubah Pin"});
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  validateUser: async (req, res, next) => {
    try {
      const { phone, email } = req.body

      let user;
      if(phone && !email){
        user = await User.findOne({'phone.content': phone});
        if(!user) return res.status(404).json({message:`${phone} belum terdaftar`, isVerified: false});
        if(!user.phone.isVerified) return res.status(200).json({message: "Nomor Hp belum terverifikasi", isVerified: false, id: user._id});
      }else if(!phone && email){
        user = await User.findOne({'email.content': email});
        if(!user) return res.status(404).json({message:`${email} belum terdaftar`, isVerified: false});
        if(!user.email.isVerified) return res.status(200).json({message: "Email belum terverifikasi", isVerified: false, id: user._id});
      }

      return res.status(200).json({message:`${phone? "Phone": "Email"} Sudah Terverifikasi`, isVerified: true, id: user._id});
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  validateDetail: async(req, res, next)=>{
    try {
      const user = await User.findById(req.user.id);
      if(!user.isDetailVerified) return res.status(403).json({
        message: "User Datanya Belum Terverifikasi"
      });
      return res.status(200).json({message:"Data Detail User Sudah Terverifikasi"});
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  editUser: async (req, res, next) => {
    try {
      if(Object.keys(req.body).length === 0) return res.status(400).json({message: "Request body tidak boleh kosong"});
      const { email, phone } = req.body;
      const id = req.user.id;
      let user;
      if(email && !phone) {
        user = await User.findByIdAndUpdate(id, {'email.content': email}, {new: true});
      }else if(!email && phone){
        user = await User.findByIdAndUpdate(id, {'phone.content': phone}, {new: true});
      }else if(email && phone){
        user = await User.findByIdAndUpdate(id, {'email.content': email, 'phone.content': phone}, {new: true});
      }
      return res.status(201).json({message: "Data User berhasil diperbarui", data: user});
    } catch (error) {
      console.log(error);
      next(error);
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
