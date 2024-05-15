// import middleware
const authorization = require("../midelware/authorization");

// import controler
const controllerPic = require("../controler/konsumen/pic-konsumen");

const router = require("express").Router();

// router auth user
router.post("/create", controllerPic.createPic);

module.exports = router;
