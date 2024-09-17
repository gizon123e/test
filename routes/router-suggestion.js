const router = require("express").Router();
const controllerSuggestion = require('../controler/suggestion');
const authorization = require("../midelware/authorization")
router.get("/", authorization, controllerSuggestion.getSuggestion);

module.exports = router