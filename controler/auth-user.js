const User = require("../models/model-auth-user");

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

      const newUser = await User.create({
        username,
        email,
        password: handleHashPassword,
        role,
        phone,
      })

      const newUserWithoutPassword = { ...newUser._doc };
      delete newUserWithoutPassword.password;

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
      const { email, password } = req.body;
      const newUser = await User.findOne({ email });
      if (!newUser) {
        return res.status(400).json({
          error: true,
          message: "invalid email / password",
        });
      }

      const validationPassword = await bcrypt.compare(
        password,
        newUser.password
      );
      if (!validationPassword) {
        return res.status(400).json({
          error: true,
          message: "invalid email / password",
        });
      }

      const tokenPayload = {
        id: newUser._id,
        name: newUser.username,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      };

      const jwtToken = jwt.createToken(tokenPayload);

      res.status(200).json({
        error: false,
        message: "login success",
        datas: {
          name: newUser.username,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          token: jwtToken,
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
