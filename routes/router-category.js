// import midelware authorization
const authorization = require("../midelware/authorization");

// controler category
const controlerCategory = require('../controler/category')

const router = require("express").Router();

router.get('/list', controlerCategory.getCategory);
router.get('/detail-main/:id', controlerCategory.getDetailCategory);
router.get('/list-subCategory/:id', controlerCategory.getCategorySub)
router.post('/create', controlerCategory.createCategory);
router.put('/update/:id', controlerCategory.updateCategory);
router.put('/update-sub/:id', controlerCategory.updateSubCategory);
router.put('/update-specific/:id', controlerCategory.updateSpacific)

router.delete('/delete/:id', controlerCategory.deleteCategory);

module.exports = router