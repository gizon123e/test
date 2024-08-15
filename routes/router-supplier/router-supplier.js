// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware");

// import controler
const conttrollerVendor = require("../../controler/supplier/supplier");
const controllerToko = require('../../controler/supplier/toko-supplier');
const controllerPic = require('../../controler/supplier/pic-supplier')
const controlerFollow = require("../../controler/follower/follower")

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, conttrollerVendor.getAllSupplier);
router.get('/detail', authorization, conttrollerVendor.getDetailSupplier)
router.get('/detail/my-store', authorization, controllerToko.myStore)
router.get('/detail/toko/:id', authorization, controllerToko.getDetailToko);
router.get('/toko/proses-pengiriman', authorization, controllerToko.getAllProsesPengiriman)
router.get('/notifikasi/rekomendasi', authorization, controllerToko.getNotifUpload);
router.post("/create", conttrollerVendor.createSupplier);
router.post("/create/toko", controllerToko.createToko);
router.post("/follow", authorization, controlerFollow.followSeller);
router.post("/pic/create", controllerPic.createPic);
router.put("/update", authorization, conttrollerVendor.updateSupplier);
router.put("/update/toko", authorization, controllerToko.updateDetailToko);
router.delete("/delete/:id", authorization, conttrollerVendor.deleteSupplier);

module.exports = router;
