const router = require('express').Router()
const controller = require('../controler/transaksi');
const authorization = require('../midelware/authorization');

router.get('/detail/:id', authorization , controller.getDetailTransaksi);

module.exports = router