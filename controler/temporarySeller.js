const { TemporaryPicSeller, TemporarySeller, TemporaryDataToko} = require('../models/model-temporary-seller');
const User = require("../models/model-auth-user");
const sendOTP = require('../utils/sendOtp');
const bcrypt = require('bcrypt')

module.exports = {
    updateSeller: async (req, res, next) => {
        try {
            const { long_pin_alamat, lat_pin_alamat, registerAs } = req.body
            const update = await TemporarySeller.findByIdAndUpdate(req.body.id, {...req.body, pinAlamat: {
                long: long_pin_alamat,
                lat: lat_pin_alamat
            }}, {new: true}).select('-codeOtp -createdAt');
            if(registerAs === "not_individu"){
                await TemporaryPic.create({
                    temporary_user: update._id
                });
            };
            return res.status(201).json({message: "Berhasil mengedit temporary data", data: update})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getDetailTemporary: async (req, res, next) => {
        try {
            const data = await TemporarySeller.findById(req.params.id).select('-createdAt');
            if(!data) return res.status(404).json({message:"Tidak ada id " + req.params.id});
            const pic = await TemporaryPicSeller.findOne({tempSeller: req.params.id}).select('-createdAt');
            const dataToko = await TemporaryDataToko.findOne({tempSeller: req.params.id}).select("-createdAt")
            return res.status(200).json({
                message: "Berhasil mendapatkan detail temporary", 
                user: data, 
                pic: data.registerAs === "not_individu" ? pic : undefined,
                dataToko
            })
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updatePic: async(req, res, next) => {
        try {
            const { long_pin_alamat, lat_pin_alamat } = req.body
            const updatePic = await TemporaryPicSeller.findOneAndUpdate({temporary_user: req.body.id}, { ...req.body, pinAlamat: {
                long: long_pin_alamat,
                lat: lat_pin_alamat
            }}).select('-createdAt')
            return res.status(200).json({message: "Berhasil Mengupdate Pic"});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    createTemporaryWithEmail: async(req, res, next) => {
        try {
            const { email } = req.body;
      
            if(!email) return res.status(400).json({message:"Tidak ada email yang dikirimkan"});
      
            const isEmailRegister = await User.exists({ 'email.content': email });
      
            if (isEmailRegister) {
              return res.status(400).json({ message: "email sudah terdaftar" });
            };
            
            //temporary User
            
            const temporarySeller = await TemporarySeller.findOne({ 'email.content': email });
      
            let newTemporary;
      
            const kode_random = Math.floor(1000 + Math.random() * 9000);
            const kode = await bcrypt.hash(kode_random.toString(), 3);
            console.log('kode otp', kode_random)
            const codeOtp = {
              code: kode,
              expire: new Date(new Date().getTime() + 5 * 60 * 1000)
            };
      
            if(!temporarySeller){
              newTemporary = await TemporarySeller.create({
                'email.content': email,
                codeOtp
              });
            }else{
              newTemporary = await TemporarySeller.findByIdAndUpdate(temporarySeller._id, { codeOtp }, { new: true })
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
      
            if(!isVerified) await sendOTP.sendOtp(email, kode_random, "register");
      
            return res.status(200).json({message: "Email Verifikasi Sudah dikirim", id: newTemporary._id, checkPoint, isVerified});
      
          } catch (error) {
            console.log(error);
            next(error)
          }
    },

    createTemporaryWithPhone: async (req, res, next) =>{
        try {
          const { phone } = req.body;
    
          if(!phone) return res.status(400).json({message:"Tidak ada phone number yang dikirimkan"});
    
          const isPhoneRegistered = await User.exists({ 'phone.content': phone });
    
          if(isPhoneRegistered) return res.status(400).json({message:`Nomor handphone ${phone} sudah terdaftar`})
    
          const temporaryUser = await TemporarySeller.findOne({ 'phone.content': phone });
    
          let newTemporary;
    
          const kode_random = Math.floor(1000 + Math.random() * 9000);
          const kode = await bcrypt.hash(kode_random.toString(), 3);
    
          const codeOtp = {
            code: kode,
            expire: new Date(new Date().getTime() + 5 * 60 * 1000)
          };
    
          if(!temporaryUser){
            newTemporary = await TemporarySeller.create({
              'phone.content': phone,
              codeOtp
            });
          }else{
            newTemporary = await TemporarySeller.findByIdAndUpdate(temporaryUser._id, { codeOtp }, { new: true })
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
    
          return res.status(200).json({message: "Email Verifikasi Sudah dikirim", id: newTemporary._id, checkPoint, isVerified});
    
        } catch (error) {
          console.log(error);
          next(error);
        }
    },

    createDataToko: async(req, res, next) => {
        try {
            const { lat_pin_alamat, long_pin_alamat } = req.body
            const data = await TemporaryDataToko.create({
                tempSeller: req.body.id,
                ...req.body,
                pinAlamat:{
                    long: long_pin_alamat,
                    lat: lat_pin_alamat
                }
            })

            return res.status(201).json({message: "Berhasil Membuat Temporary Data Toko", data})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}