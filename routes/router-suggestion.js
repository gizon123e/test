const router = require("express").Router();
const controllerSuggestion = require('../controler/suggestion');

router.get("/", controllerSuggestion.getSuggestion);

module.exports = router