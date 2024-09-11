const router = require('express').Router()
const authorization = require("../midelware/authorization");
const { createHistorySearch } = require('../controler/history-search')

router.post('/create-search', authorization, createHistorySearch)

module.exports = router