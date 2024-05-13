const mongoose = require('mongoose')

const minatModels = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    categoryMinat: {
        type: [{
            categoryId: {
                type: mongoose.Types.ObjectId,
                ref: 'SpecificCategory'
            }
        }],
        validate: [arrayLimit, '{PATH} maksimal 3 category']
    }
});

function arrayLimit(val){
    return val.length <= 3;
};
const Minat = mongoose.model("Minat", minatModels);
module.exports = Minat;