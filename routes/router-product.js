// import midelware
const authorization = require("../midelware/authorization");
const roleClasification = require("../midelware/user-role-clasification");
const notEmptyDetailData = require("../midelware/detail-data-check");
const typeFiles = require("../midelware/file-type-middleware")
//import preventing empty data
const emptyData = require("../midelware/emptyData");

// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.get("/search", controlerProduct.search);
router.get("/detail/:id", controlerProduct.productDetail);
router.get('/product_by_main_category/:id', authorization, controlerProduct.getProductWithMain);
router.get('/all_product_by_main_category/:id', authorization, controlerProduct.getAllProductWithMain);
router.get('/product_by_specific_category/:id', authorization, controlerProduct.getProductWithSpecific);
router.get('/product_by_sub_category/:id', authorization, controlerProduct.getProductWithSub);
router.get('/list_all', authorization, controlerProduct.list_all)
router.get('/list_panel', authorization, controlerProduct.list_product_adminPanel);
router.post("/upload", authorization, notEmptyDetailData, controlerProduct.upload);
router.put('/performance', authorization, controlerProduct.updateProductPerformance);
router.put('/verify/:id', authorization, controlerProduct.verifyProduct);
router.put("/editPemasok", authorization, emptyData, roleClasification.vendor, controlerProduct.pemasok);
router.put("/edit", controlerProduct.edit);
router.delete("/delete", authorization, controlerProduct.delete);

module.exports = router;
