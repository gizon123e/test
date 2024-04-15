// import midelware authorization
const authorization = require("../midelware/authorization");

// controler category
const controlerCategory = require('../controler/category')

const router = require("express").Router();

router.get('/list', authorization, controlerCategory.getCategory)
router.post('/create', authorization, controlerCategory.createCategory)
router.put('/update/:id', authorization, controlerCategory.updateCategory)
router.delete('/delete/:id', authorization, controlerCategory.deleteCategory)

module.exports = router