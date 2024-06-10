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
    const sub = await this.model.findOne({
        contents: { $in: this.getUpdate().$push.contents }
    }).lean()
    if(sub){
        next(`SpecificCategory sudah ada di SubCategory ${sub.name}`);
    }
    next()
})

const SubCategory = mongoose.model('SubCategory', subModelCategory)


module.exports = SubCategory