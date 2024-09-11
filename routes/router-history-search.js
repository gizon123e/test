const router = require('express').Router()
const authorization = require("../midelware/authorization");
const { createHistorySearch, getHistorySearch, deleteSearchHistory } = require('../controler/history-search')

router.get('/list-search', authorization, getHistorySearch)
router.post('/create-search', authorization, createHistorySearch)
router.delete('/delete-search', authorization, deleteSearchHistory)

module.exports = router