// import midelware authorization
const authorization = require("../midelware/authorization");

// controler category
const controlerCategory = require('../controler/category')

const router = require("express").Router();

router.get('/list', controlerCategory.getCategory);
router.post('/create', controlerCategory.createCategory);
router.post('/detail', controlerCategory.getDetailCategory);
router.put('/update/:id', controlerCategory.updateCategory);
router.delete('/delete/:id', controlerCategory.deleteCategory);

module.exports = router