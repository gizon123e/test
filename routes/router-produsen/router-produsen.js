// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware");

// import controler
const conttrollerProdusen = require("../../controler/produsen/produsen");
const controllerToko = require('../../controler/produsen/toko-produsen');
const controllerPic = require('../../controler/produsen/pic-produsen')
const controlerFollow = require("../../controler/follower/follower")

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, conttrollerProdusen.getAllProdusen);
router.get('/detail', authorization, conttrollerProdusen.getDetailProdusen)
router.get('/detail/my-store', authorization, controllerToko.myStore)
router.get('/detail/toko/:id', authorization, controllerToko.getDetailToko);
router.get('/toko/proses-pengiriman', authorization, controllerToko.getAllProsesPengiriman);
router.get('/toko/analisis/ringkasan', authorization, controllerToko.getRingkasan);
router.get('/toko/analisis/grafik-performa', authorization, controllerToko.grafikPerforma);
router.get('/toko/analisis/produk-populer', authorization, controllerToko.getProdukPopuler);
router.get('/notifikasi/rekomendasi', authorization, controllerToko.getNotifUpload);
router.post("/create", conttrollerProdusen.createProdusen);
router.post("/create/toko", controllerToko.createToko);
router.post("/follow", authorization, controlerFollow.followSeller);
router.post("/pic/create", controllerPic.createPic);
router.put("/update", authorization, conttrollerProdusen.updateProdusen);
router.put("/update/toko", authorization, controllerToko.updateDetailToko);
router.delete("/delete/:id", authorization, conttrollerProdusen.deleteProdusen);

module.exports = router;
