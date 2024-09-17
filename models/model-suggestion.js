const mongoose = require('mongoose');

const modelSuggestion = new mongoose.Schema({
    nama: {
        type: String
    }
})

const Suggestion = mongoose.model("Suggestion", modelSuggestion);
module.exports = Suggestion