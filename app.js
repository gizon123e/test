const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const db = require("./database/database");
const cors = require("cors");
const User = require("./user_model");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post("/signin", async (req, res) => {
  const { username, password, email } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({
      message: `Username ${username} tidak ditemukan`,
      succes: false,
    });
  }
  const token = jwt.sign(
    { username, password, email },
    process.env.SECRET_TOKEN,
    {
      expiresIn: "7d",
    }
  );
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    user.password = undefined;
    return res.status(200).json({
      message: "Login berhasil",
      data: user,
      token,
      success: true,
    });
  } else {
    return res.status(403).json({
      message: "Password yang Anda masukkan salah",
      success: false,
    });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log(req.body);
    const foundUsername = await User.findOne({ username });
    const foundEmail = await User.findOne({ email });

    if (foundEmail) {
      return res.status(302).json({
        message: `Email ${email} sudah digunakan`,
        success: false,
      });
    }

    if (foundUsername) {
      return res.status(302).json({
        message: `Username ${username} sudah digunakan`,
        success: false,
      });
    }

    if (!foundUsername && !foundEmail) {
      const salt = 10;
      const user = new User({
        ...req.body,
        password: await bcrypt.hash(password, salt),
      });

      await user.save();
      res.status(201).json({
        message: "Akun berhasil dibuat, silahkan login",
        success: true,
      });
    }
  } catch (error) {
    res.json({ error, success: false });
  }
});

db().then(() => {
  app.listen(3000, function () {
    console.log("Listening on http://localhost:3000");
  });
});
