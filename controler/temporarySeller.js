// const { TemporaryPicSeller, TemporarySeller, TemporaryDataToko} = require('../models/model-temporary-seller');
// const User = require("../models/model-auth-user");
// const sendOTP = require('../utils/sendOtp');
// const bcrypt = require('bcrypt')

// module.exports = {
//     updateSeller: async (req, res, next) => {
//         try {
//             const { long_pin_alamat, lat_pin_alamat, registerAs } = req.body
//             const update = await TemporarySeller.findByIdAndUpdate(req.body.id, {...req.body, pinAlamat: {
//                 long: long_pin_alamat,
//                 lat: lat_pin_alamat
//             }}, {new: true}).select('-codeOtp -createdAt');
//             if(registerAs === "not_individu"){
//                 await TemporaryPic.create({
//                     temporary_user: update._id
//                 });
//             };
//             return res.status(201).json({message: "Berhasil mengedit temporary data", data: update})
//         } catch (error) {
//             console.log(error);
//             next(error);
//         }
//     },

//     getDetailTemporary: async (req, res, next) => {
//         try {
//             const data = await TemporarySeller.findById(req.params.id).select('-createdAt');
//             if(!data) return res.status(404).json({message:"Tidak ada id " + req.params.id});
//             const pic = await TemporaryPicSeller.findOne({tempSeller: req.params.id}).select('-createdAt');
//             const dataToko = await TemporaryDataToko.findOne({tempSeller: req.params.id}).select("-createdAt")
//             return res.status(200).json({
//                 message: "Berhasil mendapatkan detail temporary", 
//                 user: data, 
//                 pic: data.registerAs === "not_individu" ? pic : undefined,
//                 dataToko
//             })
//         } catch (error) {
//             console.log(error);
//             next(error);
//         }
//     },

//     updatePic: async(req, res, next) => {
//         try {
//             const { long_pin_alamat, lat_pin_alamat } = req.body
//             const updatePic = await TemporaryPicSeller.findOneAndUpdate({temporary_user: req.body.id}, { ...req.body, pinAlamat: {
//                 long: long_pin_alamat,
//                 lat: lat_pin_alamat
//             }}).select('-createdAt')
//             return res.status(200).json({message: "Berhasil Mengupdate Pic"});
//         } catch (error) {
//             console.log(error);
//             next(error);
//         }
//     },

//     createDataToko: async(req, res, next) => {
//         try {
//             const { lat_pin_alamat, long_pin_alamat } = req.body
//             const data = await TemporaryDataToko.create({
//                 tempSeller: req.body.id,
//                 ...req.body,
//                 pinAlamat:{
//                     long: long_pin_alamat,
//                     lat: lat_pin_alamat
//                 }
//             })

//             return res.status(201).json({message: "Berhasil Membuat Temporary Data Toko", data})
//         } catch (error) {
//             console.log(error);
//             next(error);
//         }
//     }
// }