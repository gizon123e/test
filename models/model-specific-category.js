const mongoose = require('mongoose')

const modelSpecificCategory = new mongoose.Schema({
    name: {
        required: [true, 'name Category harus di isi'],
        type: String,
        unique: true
    },
    icon: {
        type: String
    },
    show_at_web:{
        type: Boolean,
        default: false
    },
    icon:{
        type: String,
        default: "https://staging-backend.superdigitalapps.my.id/public/icon/kursi.jpg"
    }
}, { timestamp: true })

// modelSpecificCategory.pre('save', async function(next){
//     const specific_category = this;
//     const duplicate = await mongoose.models.subCategory.findOne({
//         contents: { $in: specific_category._id }
//     })

//     if(duplicate){
//         if (duplicate) {
//             const err = new Error(`SpecificCategory ${content} sudah ada di SubCategory ${duplicate.name}`);
//             next(err);
//             return;
//         }
//     }

//     next()
// })

const SpecificCategory = mongoose.model('SpecificCategory', modelSpecificCategory)

module.exports = SpecificCategory