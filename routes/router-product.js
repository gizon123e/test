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
router.get("/list", emptyData, authorization, roleClasification.seller, controlerProduct.list_product);
router.post("/upload", emptyData, authorization, roleClasification.seller, controlerProduct.upload);
router.post("/addComment", emptyData, authorization, controlerProduct.addComment);
router.put('/editPemasok', emptyData, authorization, roleClasification.vendor, controlerProduct.pemasok)
router.put('/edit', emptyData, authorization, controlerProduct.edit)
router.delete('/delete', emptyData, authorization, controlerProduct.delete)

module.exports = router;
