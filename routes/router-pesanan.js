<<<<<<< HEAD
// import midelware authorization
const authorization = require("../midelware/authorization");

//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")


// import controler
const controlerPesanan = require("../controler/pesanan");

const router = require("express").Router();

// router product management
router.post("/buat", authorization, controlerPesanan.make);
router.get("/list", authorization, roleClasification, controlerPesanan.list_pesanan)
router.put("/update_status", authorization, roleClasification, controlerPesanan.update_status)


module.exports = router;
=======
// import midelware authorization
const authorization = require("../midelware/authorization");

//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")


// import controler
const controlerPesanan = require("../controler/pesanan");

const router = require("express").Router();

// router product management
router.post("/buat", authorization, controlerPesanan.make);
router.get("/list", authorization, roleClasification, controlerPesanan.list_pesanan)
router.put("/update_status", authorization, roleClasification, controlerPesanan.update_status)


module.exports = router;
>>>>>>> b5a31a26557174393446f828752b57d536e79998
