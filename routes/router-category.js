// import midelware authorization
const authorization = require("../midelware/authorization");

// controler category
const controlerCategory = require('../controler/category')

const router = require("express").Router();

router.get('/list', controlerCategory.getCategory);
router.get('/detail', controlerCategory.getDetailCategory);
router.post('/create', controlerCategory.createCategory);
router.put('/update/:id', controlerCategory.updateCategory);
router.put('/update-sub/:id', controlerCategory.updateSubCategory);

router.delete('/delete/:id', controlerCategory.deleteCategory);

module.exports = router