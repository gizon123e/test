const router = require('express').Router()

const { getCategoryUtamaInformasiBantuan, createCategoryUtamaInformasiBantuan } = require('../../controler/informasi-bantuan/category-utama-informasi-bantuan')

router.get('/list-judul-utama', getCategoryUtamaInformasiBantuan)
router.post('/create-judul-utama', createCategoryUtamaInformasiBantuan)

module.exports = router