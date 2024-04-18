// import midelware authorization
const authorization = require("../midelware/authorization");
 
// import controler
const controlerKomentar = require("../controler/komentar");

const router = require("express").Router();

// router product management
router.get("/listAll", controlerKomentar.listComments);
router.post("/create", authorization, controlerKomentar.addComment);
router.post("/reply", authorization, controlerKomentar.replyComment);

module.exports = router;
