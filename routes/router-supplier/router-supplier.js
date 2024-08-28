// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware");

// import controler
const controllerSupplier = require("../../controler/supplier/supplier");
const controllerToko = require('../../controler/supplier/toko-supplier');
const controllerPic = require('../../controler/supplier/pic-supplier')
const controlerFollow = require("../../controler/follower/follower")

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerSupplier.getAllSupplier);
router.get('/detail', authorization, controllerSupplier.getDetailSupplier)
router.get('/detail/my-store', authorization, controllerToko.myStore)
router.get('/detail/toko/:id', authorization, controllerToko.getDetailToko);
router.get('/toko/proses-pengiriman', authorization, controllerToko.getAllProsesPengiriman)
router.get('/notifikasi/rekomendasi', authorization, controllerToko.getNotifUpload);
router.post("/create", controllerSupplier.createSupplier);
router.post("/create/toko", controllerToko.createToko);
router.post("/follow", authorization, controlerFollow.followSeller);
router.post("/pic/create", controllerPic.createPic);
router.put("/update", authorization, controllerSupplier.updateSupplier);
router.put("/update/toko", authorization, controllerToko.updateDetailToko);
router.delete("/delete/:id", authorization, controllerSupplier.deleteSupplier);

module.exports = router;
