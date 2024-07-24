const authorization = require("../midelware/authorization");
 
// import controler
const controllerInvoice = require("../controler/invoice");

const router = require("express").Router();

router.get('/detail/:id', authorization , controllerInvoice.detailInvoice);

module.exports = router;
