// import midelware authorization
const authorization = require("../midelware/authorization");

//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")


// import controler
const controlerPesanan = require("../controler/pesanan");

const router = require("express").Router();

// router product management
router.post("/buat", authorization, roleClasification, controlerPesanan.make);


module.exports = router;
