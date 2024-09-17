const mongoose = require('mongoose')
const SpecificCategory = require('./model-specific-category')

const subModelCategory = new mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String,
        index: true
    },
    contents: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SpecificCategory"
        }
    ],
}, { timestamp: true });

subModelCategory.pre('findOneAndUpdate', async function (next) {
    if (this.getUpdate()?.$push?.contents) {
        const main = await this.model.findOne({
            contents: { $in: this.getUpdate().$push.contents }
        }).lean()
        if (main) {
            const specific = await SpecificCategory.findOne({ _id: this.getUpdate().$push.contents })
            const update = await SpecificCategory.create({
                name: specific.name
            })
            this.getUpdate().$push.contents = update._id
        }
    }
    next()
})

const SubCategory = mongoose.model('SubCategory', subModelCategory)


module.exports = SubCategory