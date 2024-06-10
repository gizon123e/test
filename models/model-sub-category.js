const mongoose = require('mongoose')

const subModelCategory = new mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String
    },
    contents: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SpecificCategory"
        }
    ],
}, { timestamp: true })

subModelCategory.pre('findOneAndUpdate', async function(next){
    const subCategory = this;
    for(const content of subCategory.contents){
        const duplicate = await mongoose.models.subCategory.findOne({
            _id: { $ne: subCategory._id },
            contents: content   
        });

        if (duplicate) {
            const err = new Error(`SpecificCategory ${content} sudah ada di SubCategory ${duplicate.name}`);
            next(err);
            return;
        }
    }
    next()
})

const SubCategory = mongoose.model('SubCategory', subModelCategory)

module.exports = SubCategory