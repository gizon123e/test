const mongoose = require('mongoose')
const SubCategory = require('./model-sub-category')

const mainModelCategory = new mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String
    },
    contents: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SubCategory"
        }
    ],
    icon: {
        type: String,
        default: ""
    },
    showAt: {
        type: String,
        enum: ["mobile", "web", "mobile dan web", "all"],
        default: "all",
        required: ['true', "show at harus ada"]
    },
    for: {
        type: String,
        enum: ["konsumen", "vendor", "supplier", "produsen"]
    }
}, { timestamp: true })

mainModelCategory.index({ name: 1, for: 1 }, { unique: true });

mainModelCategory.pre('findOneAndUpdate', async function (next) {
    if (this.getUpdate()?.$push?.contents) {
        const main = await this.model.findOne({
            contents: { $in: this.getUpdate().$push.contents }
        }).lean()
        if (main) {
            const specific = await SubCategory.findOne({ _id: this.getUpdate().$push.contents })
            const update = await SubCategory.create({
                name: specific.name
            })
            this.getUpdate().$push.contents = update._id
        }
    }
    next()
})

const MainCategory = mongoose.model('MainCategory', mainModelCategory)

module.exports = MainCategory