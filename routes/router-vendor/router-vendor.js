// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware");

// import controler
const controllerVendor = require("../../controler/vendor/vendor");
const controllerToko = require('../../controler/vendor/toko-vendor');
const controllerPic = require('../../controler/vendor/pic-vendor')
const controllerPenghasilan = require('../../controler/vendor/penghasilan')

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerVendor.getAllVendor);
router.get('/detail', authorization, controllerVendor.getDetailVendor)
router.get('/detail/my-store', authorization, controllerToko.myStore)
router.get('/detail/toko/:id', authorization, controllerToko.getDetailToko);
router.get('/toko/proses-pengiriman', authorization, controllerToko.getAllProsesPengiriman)
router.get('/notifikasi/rekomendasi', authorization, controllerToko.getNotifUpload);
router.get('/toko/penghasilan', authorization, controllerPenghasilan.getPenghasilan);
router.post("/create", controllerVendor.createVendor);
router.post("/create/toko", controllerToko.createToko);
router.post("/pic/create", controllerPic.createPic);
router.put("/update", authorization, controllerVendor.updateVendor);
router.put("/update/toko", authorization, controllerToko.updateDetailToko);
router.delete("/delete/:id", authorization, controllerVendor.deleteVendor);

module.exports = router;
