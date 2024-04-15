// import midelware authorization
const authorization = require("../midelware/authorization");

//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")

//middleware empty data
const emptyData = require("../midelware/emptyData")

// import controler
const controlerPesanan = require("../controler/pesanan");

const router = require("express").Router();

// router product management
router.post("/buat", authorization, emptyData, controlerPesanan.make);
router.get("/list", authorization, emptyData, roleClasification.seller, controlerPesanan.list_pesanan)
router.put("/update_status", authorization, emptyData, roleClasification.seller, controlerPesanan.update_status)


module.exports = router;
