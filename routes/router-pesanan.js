// import midelware authorization
const authorization = require("../midelware/authorization");

//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")


// import controler
const controlerPesanan = require("../controler/pesanan");

const router = require("express").Router();

// router product management
router.post("/buat", authorization, controlerPesanan.make);
router.get("/list", authorization, roleClasification.seller, controlerPesanan.list_pesanan)
router.put("/update_status", authorization, roleClasification.seller, controlerPesanan.update_status)


module.exports = router;
