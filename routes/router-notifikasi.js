const router = require('express').Router();
const controlerNotifikasi = require('../controler/notifikasi');
const authorization = require("../midelware/authorization");

router.get('/get', authorization, controlerNotifikasi.getNotifikasi);
router.get('/send', controlerNotifikasi.sendNotifikasi);

module.exports = router;