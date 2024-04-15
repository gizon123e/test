// import midelware authorization
const authorization = require("../midelware/authorization");
//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")
//import preventing empty data 
const emptyData = require("../midelware/emptyData")

// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.get("/list", authorization, emptyData, roleClasification.seller, controlerProduct.list_product);
router.post("/upload", authorization, emptyData, roleClasification.seller, controlerProduct.upload);
router.post("/addComment", authorization, emptyData, controlerProduct.addComment);
router.put('/editPemasok', authorization, emptyData, roleClasification.vendor, controlerProduct.pemasok)
router.put('/edit', authorization, emptyData, controlerProduct.edit)
router.delete('/delete', authorization, emptyData, controlerProduct.delete)

module.exports = router;
