const mongoose = require('mongoose')

const minatModels = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    categoryMinat: {
        type: [{
            _id: false,
            categoryId: {
                type: mongoose.Types.ObjectId,
                ref: 'SpecificCategory'
            },
            countHit:{
                type: Number,
                default: 0
            },
            time: {
                type: Date,
                default: Date.now()
            }
        }],
    }
});

const Minat = mongoose.model("Minat", minatModels);
module.exports = Minat;