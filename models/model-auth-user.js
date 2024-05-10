const mongoose = require("mongoose");

const userModels = mongoose.Schema(
  {
    email: {
      content: {
        type: String,
        maxlength: [250, "panjang email harus di antara 3 - 250 karakter"],
        validate: {
          validator: (email) => {
            const emailRegex =
              /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/;
            return emailRegex.test(email);
          },
          message: (props) => `${props.value} email tidak valid`,
        },
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    password: {
      type: String,
      maxlength: [250, "panjang password harus di antara 3 - 250 karakter"],
      minlength: [3, "panjang password harus di antara 3 - 250 karakter"],
    },
    phone: {
      content:{
        type: String,
        minlength: [9, "panjang password harus di antara 3 - 250 karakter"],
        validate: {
          validator: (phone) => {
            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
            return regexNoTelepon.test(phone)
          },
          message: (props) => `${props.value} nomor handphone tidak valid`
        }
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    pin: {
      type: String,
    },
    role: {
      type: String,
      enum: ["vendor", "konsumen", "produsen", "supplier", "distributor"],
      message: "{VALUE} is not supported",
    },
    codeOtp:{
      code: {
        type: String
      },
      expire: {
        type: Date
      }
    }
  },
  { temestamp: true }
);

const User = mongoose.model("User", userModels);

module.exports = User;