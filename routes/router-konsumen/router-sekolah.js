const router = require('express').Router()
const controllerSekolah = require('../../controler/konsumen/sekolah')
const authorization = require("../../midelware/authorization")

router.post("/create", authorization, controllerSekolah.createSekolah)

module.exports = router