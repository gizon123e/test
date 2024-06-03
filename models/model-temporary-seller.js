// const { Decimal128 } = require('mongodb');
// const mongoose = require('mongoose');

// const modelTemporary = new mongoose.Schema({
//     email: {
//         content: {
//           type: String,
//           maxlength: [250, "panjang email harus di antara 3 - 250 karakter"],
//           validate: {
//             validator: (email) => {
//               const emailRegex =
//                 /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/;
//               return emailRegex.test(email);
//             },
//             message: (props) => `${props.value} email tidak valid`,
//           },
//           default: undefined
//         },
//         isVerified: {
//           type: Boolean,
//           default: false
//         }
//     },
//     phone: {
//         content:{
//           type: String,
//           minlength: [9, "panjang password harus di antara 3 - 250 karakter"],
//           validate: {
//             validator: (phone) => {
//               const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
//               return regexNoTelepon.test(phone)
//             },
//             message: (props) => `${props.value} nomor handphone tidak valid`
//           },
//           default: undefined
//         },
//         isVerified: {
//           type: Boolean,
//           default: false
//         }
//     },
//     registerAs: {
//         type: String,
//         enum: ["individu", "not_individu"]
//     },
//     role: {
//         type: String
//     },
//     nama: {
//         type: String
//     },
//     nik: {
//         type: String
//     },
//     npwp: {
//         type: String
//     },
//     nomorAktaPerusahaan: {
//         type: String
//     },
//     nomorNpwpPerusahaan: String,
//     noTeleponKantor: String,
//     province: String,
//     regency: String,
//     district: String,
//     village: String,
//     address_description: String,
//     label: String,
//     code_pos: String,
//     pinAlamat: {
//         long: Decimal128,
//         lat: Decimal128
//     },
//     codeOtp:{
//         code: {
//           type: String
//         },
//         expire: {
//           type: Date
//         }
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//       index: { expires: '7d' }  // TTL index to expire documents 7 days after creation
//     }  
// });

// const modelTemporaryPic = new mongoose.Schema({
//     nama: String,
//     nik: {
//       type: String
//     },
//     npwp: {
//       type: String
//     },
//     jabatan: String,
//     province: String,
//     regency: String,
//     district: String,
//     village: String,
//     address_description: String,
//     label: String,
//     code_pos: String,
//     pinAlamat: {
//       long: Decimal128,
//       lat: Decimal128
//     },
//     temporary_user:{
//         type: mongoose.Types.ObjectId,
//         ref: "TemporarySeller"
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//       index: { expires: '7d' }  // TTL index to expire documents 7 days after creation
//     }  
// });

// const modelTemporaryDataToko = new mongoose.Schema({
//     namaToko: {
//         type: String,
//         required: [true, "Nama Toko Harus diisi"]
//     },
//     province: String,
//     regency: String,
//     district: String,
//     village: String,
//     address_description: String,
//     label: String,
//     code_pos: String,
//     pinAlamat: {
//         long: Decimal128,
//         lat: Decimal128
//     },
//     tempSeller: {
//         type: mongoose.Types.ObjectId,
//         ref: "TemporarySeller"
//     }
// })

// const TemporarySeller = mongoose.model("TemporarySeller", modelTemporary);
// const TemporaryPicSeller = mongoose.model("TemporaryPicSeller", modelTemporaryPic);
// const TemporaryDataToko = mongoose.model("TemporaryDataToko", modelTemporaryDataToko)
// module.exports = { TemporaryPicSeller, TemporarySeller, TemporaryDataToko }