const router = require('express').Router()
const controller = require('../controler/wishlist');
const authorization = require('../midelware/authorization');

router.get('/list', authorization, controller.getAllWishlist);
router.post('/add', authorization, controller.addWishlist);

module.exports = router