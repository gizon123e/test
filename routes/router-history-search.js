const router = require('express').Router()
const authorization = require("../midelware/authorization");
const { createHistorySearch, getHistorySearch } = require('../controler/history-search')

router.get('/list-search', authorization, getHistorySearch)
router.post('/create-search', authorization, createHistorySearch)

module.exports = router