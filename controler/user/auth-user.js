const User = require("../../models/model-auth-user");
const { TemporaryUser } = require('../../models/model-temporary-user')
const sendOTP = require("../../utils/sendOtp").sendOtp;
const sendPhoneOTP = require('../../utils/sendOtp').sendOtpPhone
const Pengiriman = require("../../models/model-pengiriman")
const jwt = require("../../utils/jwt");
const {getToken} = require("../../utils/getToken");
const bcrypt = require("bcrypt");
const temporaryUser = require("../temporaryUser");
const DeviceId = require("../../models/model-token-device");
const RequestDeleteAccount = require("../../models/user/model-request-hapus-akun");
const { verify } = require("jsonwebtoken");
const TokoVendor = require("../../models/vendor/model-toko");
const TokoSupplier = require("../../models/supplier/model-toko");
const TokoProdusen = require("../../models/produsen/model-toko");
const Distributtor = require("../../models/distributor/model-distributor");

module.exports = {

  sendOtpWithEmail: async (req, res, next) =>{
    try {
      const { email } = req.body;

      if(!email) return res.status(400).json({message:"Tidak ada email yang dikirimkan"});

      const isEmailRegister = await User.exists({ 'email.content': email.toLowerCase() });

      if (isEmailRegister) {
        return res.status(400).json({ message: "email sudah terdaftar" });
      };
      
      //temporary User
      
      const temporaryUser = await TemporaryUser.findOne({ 'email.content': email.toLowerCase() });

      let newTemporary;

      const kode_random = Math.floor(1000 + Math.random() * 9000);
      const kode = await bcrypt.hash(kode_random.toString(), 3);

      const codeOtp = {
        code: kode,
        expire: new Date(new Date().getTime() + 5 * 60 * 1000)
      };

      if(!temporaryUser){
        newTemporary = await TemporaryUser.create({
          'email.content': email.toLowerCase(),
          codeOtp
        });
      }else{
        newTemporary = await TemporaryUser.findByIdAndUpdate(temporaryUser._id, { codeOtp }, { new: true })
      };

      function check() {
        if( newTemporary._doc.registerAs && Object.keys(newTemporary._doc).length > 6){
          return "detail"
        }else if(!newTemporary.registerAs && newTemporary.role){
          return "role"
        }else{
          return null
        }
      }

      function verification(){
        if(newTemporary.email.isVerified || newTemporary.phone.isVerified) return true
        return false
      }

      const isVerified = verification()

      const checkPoint = check();

      if(!isVerified) await sendOTP(email, kode_random, "register");

      return res.status(200).json({message: "Email Verifikasi Sudah dikirim", id: newTemporary._id, checkPoint, isVerified});

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

      if(isPhoneRegistered) return res.status(400).json({message:`Nomor handphone ${phone} sudah terdaftar`})

      const temporaryUser = await TemporaryUser.findOne({ 'phone.content': phone });

      let newTemporary;

      const kode_random = Math.floor(1000 + Math.random() * 9000);
      const kode = await bcrypt.hash(kode_random.toString(), 3);

      const codeOtp = {
        code: kode,
        expire: new Date(new Date().getTime() + 5 * 60 * 1000)
      };

      if(!temporaryUser){
        newTemporary = await TemporaryUser.create({
          'phone.content': phone,
          codeOtp
        });
      }else{
        newTemporary = await TemporaryUser.findByIdAndUpdate(temporaryUser._id, { codeOtp }, { new: true })
      };

      function check() {
        if(newTemporary._doc.registerAs && Object.keys(newTemporary._doc).length > 6){
          return "detail"
        }else if(!newTemporary.registerAs && newTemporary.role){
          return "role"
        }else{
          return null
        }
      }

      function verification(){
        if(newTemporary.email.isVerified || newTemporary.phone.isVerified) return true
        return false
      }

      const isVerified = verification()

      const checkPoint = check();

      if(!isVerified) await sendPhoneOTP(phone, `KODE OTP :  ${kode_random} berlaku selama 5 menit. RAHASIAKAN KODE OTP Anda! Jangan beritahukan kepada SIAPAPUN!`)

      return res.status(200).json({message: "Phone Verifikasi Sudah dikirim", id: newTemporary._id, checkPoint, isVerified});

    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  deleteAccountCheck: async(req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("email role");
      let dataOrder;
      switch(user.role){
        case "konsumen":
          dataOrder = await Pengiriman.find({ user: req.user.id, isBuyerAccepted: false });
          break;
        case "vendor":
          const tokoVendor = await TokoVendor.findOne({ userId: req.user.id });
          dataOrder = await Pengiriman.find({ user: req.user.id, isBuyerAccepted: false }) || await Pengiriman.find({ toko: tokoVendor._id, isBuyerAccepted: false });
          break;
        case "supplier":
          const tokoSupplier = await TokoSupplier.findOne({ userId: req.user.id });
          dataOrder = await Pengiriman.find({ user: req.user.id, isBuyerAccepted: false }) || await Pengiriman.find({ toko: tokoSupplier._id, isBuyerAccepted: false });
          break;
        case "produsen":
          const tokoProdusen = await TokoProdusen.findOne({ userId: req.user.id });
          dataOrder = await Pengiriman.find({ toko: tokoProdusen._id, isBuyerAccepted: false });
          break
        case "distributor":
          const distri = await Distributtor.findOne({ userId: req.user.id });
          dataOrder = await Pengiriman.find({ distributorId: distri._id, isBuyerAccepted: false });
          break;
      }

      return res.status(200).json({ message: "Check for delete account successfully", data: { 
        user: {
          passed: user.email.content ? true : false
        }, 
        dataOrder: {
          passed: dataOrder.length === 0 ? true : false
        },
        saldo: {
          passed: true
        }
      }});
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  requestDeleteAccount: async(req, res, next) => {
    try {
      const { reason } = req.body
      if(!reason || reason.trim().length === 0) return res.status(400).json({message: "Kirimkan alasan menghapus akun"});
      const user = await User.findById(req.user.id).select("email");
      const dataOrder = await Pengiriman.find({ user: req.user.id, isBuyerAccepted: false });
      if(!user.email.content || dataOrder.length > 0){
        return res.status(403).json({message: "Anda tidak memenuhi syarat menghapus akun"});
      }
      await RequestDeleteAccount.create({ userId: req.user.id , reason });
      return res.status(200).json({message: "Berhasil mengajukan penghapusan akun"})
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  register: async (req, res, next) => {
    try {
      const { id, password, role } = req.body;
      if(!id) return res.status(400).json({message: "Tidak ada id yang dikirim"});
      if(!password) return res.status(400).json({message: "Tidak ada password yang dikirim"});
      const temporary = await TemporaryUser.findById(id).lean();
      if(!temporary) return res.status(404).json({message: "Tidak ada user dengan id " + id});
      if(!temporary.phone.isVerified && !temporary.email.isVerified) return res.status(403).json({message: "User belum terverifikasi"});
      const hashedPassword = await bcrypt.hash(password, 10)
      let user
      if(req.headers["from"] !== "Web"){
        user = await User.create({ _id: temporary._id, ...temporary, password: hashedPassword});
      }else{
        user = await User.create({ _id: temporary._id, role, password: hashedPassword, ...temporary});
      }

      const newUserWithoutPassword = { ...user._doc };
      delete newUserWithoutPassword.password;
      delete newUserWithoutPassword.codeOtp;
      delete newUserWithoutPassword.pin;
      
      await TemporaryUser.deleteOne({_id: id});
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

  checkToken: async (req, res, next) => {
    try {
      const token = getToken(req)
      const verifyToken = jwt.verifyToken(token);
      const deviceId = req.headers["x-header-deviceid"]
      if(!deviceId) return res.status(401).json({ error: true, message: 'Kirimkan device id di headers' });
      if(!verifyToken) return res.status(401).json({ error: true, message: 'Invalid Token' });
      const user = await User.exists(verifyToken.id);
      if(!user) return res.status(401).json({ error: true, message: 'Invalid Token' });
      const device = await DeviceId.exists({userId: verifyToken.id, deviceId});
      if(!device) return res.status(401).json({ error: true, message: 'Invalid Token' });
      return res.status(200).json({message: "Token valid"});
    } catch (error) {
      console.log(error);
      if (error.message === "Token has expired") {
        return res.status(401).json({ error: true, message: 'Token has expired' });
      } else if (error.message === "Invalid Token") {
        return res.status(401).json({ error: true, message: 'Invalid Token' });
      }
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password, phone, pin } = req.body;
      let newUser;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      if(email && !phone){
        newUser = await User.findOne({ 'email.content': email.toLowerCase() });
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

      const passwordValid = await bcrypt.compare(password, newUser.password)
      if(!passwordValid) return res.status(401).json({message: "Password yang dimasukkan salah"});

      const deviceId = req.headers["x-header-deviceid"];
      const brand = req.headers["x-device-brand"];

      if(!deviceId) return res.status(404).json({message: "kirimkan header yang dibutuhkan"})
      let existedDeviceId = await DeviceId.findOne({userId: newUser._id, deviceId});
      

      if(!existedDeviceId){
        existedDeviceId = await DeviceId.create({
          userId: newUser._id,
          deviceId,
          device: brand,
          login_at: new Date(),
          ip
        });
      }

      if(existedDeviceId?.valid_until?.getTime() < new Date().getTime() || !existedDeviceId?.valid_until){
        
        const kode_random = Math.floor(1000 + Math.random() * 9000);
        const kode = await bcrypt.hash(kode_random.toString(), 3);
        
        const codeOtp = {
          code: kode,
          expire: new Date(new Date().getTime() + 5 * 60 * 1000)
        };

        newUser.codeOtp = codeOtp;
        await newUser.save();

        if(email && !phone){ 
          await sendOTP(email, kode_random, "login")
        }else if(!email && phone) {
          await sendPhoneOTP(phone, `KODE OTP :  ${kode_random} berlaku selama 5 menit. RAHASIAKAN KODE OTP Anda! Jangan beritahukan kepada SIAPAPUN!`)
        }

        return res.status(200).json({
          error: false,
          message: `${phone? "Phone" : "Email"} verifikasi sudah dikirim!`,
          id: newUser._id,
          token: null
        });
      }else {
        const tokenPayload = {
          id: newUser._id,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        };

        await DeviceId.updateOne(
          { userId: newUser._id },
          { login_at: new Date(), valid_until: new Date().setDate(new Date().getDate() + 3 ) }
        )

        const jwtToken = jwt.createToken(tokenPayload);
        return res.status(200).json({
          error: false,
          message: `Berhasil Login`,
          ...tokenPayload,
          token: jwtToken
        });
      }

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

  verifyPassword: async(req, res, next) =>{
    try {
      const { password } = req.body
      if(!password || password.trim().length === 0) return res.status(400).json({message: "password Kosong"})
      const user = await User.findById(req.user.id);
      const validatePw = await bcrypt.compare(
        password,
        user.password
      );
      if(!validatePw) return res.status(401).json({message: "Password Salah"});
      const tokenPw = {
        userId: req.user.id,
        password: password
      }

      const token = jwt.createToken(tokenPw)
      return res.status(200).json({message: "Password Benar", token});
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  chekDuplicateNumberOrEmail: async(req, res, next) => {
    try {
      const { email , phone } = req.body;
      let user
      if(email && !phone) {
        duplicate =  await User.exists({'email.content': email});
        if(duplicate) return res.status(403).json({message: `email ${email} sudah terdaftar`})
      }else if(!email && phone){
        duplicate =  await User.exists({'phone.content': phone})
        if(duplicate) return res.status(403).json({message: `phone ${phone} sudah terdaftar`})
      }else if(email && phone){
        const [phoneExists, emailExists] = await Promise.all([
          User.exists({'phone.content': phone}),
          User.exists({'email.content': email})
        ]);
        if (phoneExists || emailExists) {
          return res.status(403).json({ message: 'phone atau email sudah terdaftar' });
        };
      }

      return res.status(200).json({message: `${email? email : phone} bisa digunakan`});
    } catch (error) {
      
    }
  },

  editPin: async(req, res, next) =>{
    try {
      const { pin, token } = req.body;
      if(!pin || pin.trim().length === 0) return res.status(400).json({message: "Pin Kosong"});
      if(pin.trim().length > 6) return res.status(400).json({message: "Pin maksimal 6 digit"})
      const hashedPin =  await bcrypt.hash(pin, 10);
      const verifyToken = jwt.verifyToken(token);

      const user = await User.findById(req.user.id);
      const pinValid = await bcrypt.compare(pin, user.pin)
      if(pinValid) return res.status(403).json({message: "tidak boleh memakai pin sebelumnya"})

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

  editPassword: async(req, res, next) =>{
    try {
      const { password, token } = req.body;
      if(!password || password.trim().length === 0) return res.status(400).json({message: "Password Kosong"});
      const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%#?&]{8,}$/;
      if(!regexPassword.test(password)) return res.status(400).json({message: "Password tidak valid"})
      const hashedPassword =  await bcrypt.hash(password, 10);
      const verifyToken = jwt.verifyToken(token);
      const user = await User.findById(req.user.id);
      const passwordValid = await bcrypt.compare(password, user.password)
      if(passwordValid) return res.status(403).json({message: "tidak boleh memakai password sebelumnya"})
      if(!verifyToken) return res.status(401).json({message: "Token Salah"});
      if(verifyToken.userId !== req.user.id) return res.status(403).json({message: "Tidak Bisa Mengubah Password Orang Lain"});

      await User.findByIdAndUpdate(req.user.id, {
        password: hashedPassword
      });
      
      return res.status(201).json({message: "Berhasil Mengubah Password"});
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
      let duplicate;
      if(email && !phone) {
        duplicate =  await User.exists({'email.content': email});
        if(duplicate) return res.status(403).json({message: `email ${email} sudah terdaftar`})
        user = await User.findByIdAndUpdate(id, {'email.content': email}, {new: true});
      }else if(!email && phone){
        duplicate =  await User.exists({'phone.content': phone})
        if(duplicate) return res.status(403).json({message: `phone ${phone} sudah terdaftar`})
        user = await User.findByIdAndUpdate(id, {'phone.content': phone}, {new: true});
      }else if(email && phone){
        const [phoneExists, emailExists] = await Promise.all([
          User.exists({'phone.content': phone}),
          User.exists({'email.content': email})
        ]);
        if (phoneExists || emailExists) {
          return res.status(403).json({ message: 'phone atau email sudah terdaftar' });
        };
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

  resetPassword: async(req, res, next) => {
    try {
      const { password, userId, token_reset } = req.body
      const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%#?&]{8,}$/;
      if(!regexPassword.test(password)) return res.status(400).json({message: "Password tidak valid"});
      const password_baru = await bcrypt.hash(password, 10);
      const user = await User.findOne({
        _id: userId,
        'token.value': token_reset,
        'token.verified': true
      });
      if(!user) return res.status(404).json({message: "Permintaan tidak valid"});
      const passwordValid = await bcrypt.compare(password, user.password)
      if(passwordValid) return res.status(403).json({message: "tidak boleh memakai password sebelumnya"})
      User.findByIdAndUpdate(
        userId,
        {
          password: password_baru
        }
      )
      .then(async(user)=> {
        console.log('berhasil edit password')
        await User.updateOne({_id: user._id}, {'token.value': null, 'token.verified': false, 'token.expired': null})
      })
      .catch((e) => console.log("error: ", e))
      return res.status(201).json({message: "Berhasil Mengubah Password"});
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  resetPin: async(req, res, next) => {
    try {
      const { pin, userId, token_reset } = req.body
      if(!pin || pin.trim().length === 0) return res.status(400).json({message: "Pin Kosong"});
      if(pin.trim().length > 6) return res.status(400).json({message: "Pin maksimal 6 digit"})
      const pin_baru = await bcrypt.hash(pin, 10);
      const user = await User.findOne({
        _id: userId,
        'token.value': token_reset,
        'token.verified': true
      });
      if(!user) return res.status(404).json({message: "Permintaan tidak valid"});
      const pinValid = await bcrypt.compare(pin, user.pin)
      if(pinValid) return res.status(403).json({message: "tidak boleh memakai pin sebelumnya"})
      User.findByIdAndUpdate(
        userId,
        {
          pin: pin_baru
        }
      )
      .then(async(user)=> {
        console.log('berhasil edit pin')
        await User.updateOne({_id: user._id}, {'token.value': null, 'token.verified': false, 'token.expired': null})
      })
      .catch((e) => console.log("error: ", e))
      return res.status(201).json({message: "Berhasil Mengubah Pin"});
    } catch (error) {
      console.log(error);
      next(error)
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
