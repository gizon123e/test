// import midelware
const authorization = require("../midelware/authorization");
const roleClasification = require("../midelware/user-role-clasification");
const notEmptyDetailData = require("../midelware/detail-data-check");
//import preventing empty data
const emptyData = require("../midelware/emptyData");

// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.get("/search", controlerProduct.search);
router.get("/detail/:id", controlerProduct.productDetail);
router.get('/list_all', authorization , controlerProduct.list_all)
router.post("/upload", authorization, notEmptyDetailData, controlerProduct.upload);
router.put('/performance', authorization, controlerProduct.updateProductPerformance)
router.put("/editPemasok", authorization, emptyData, roleClasification.vendor, controlerProduct.pemasok);
router.put("/edit", authorization, controlerProduct.edit);
router.delete("/delete", authorization, controlerProduct.delete);

module.exports = router;
