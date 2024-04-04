const mongoose = require('mongoose')
const User = require('./model-auth-user')
const productModels = mongoose.Schema({
    name_product: {
        type: String,
        maxlength: [250, 'panjang nama harus antara 5 - 250 karakter'],
        minlength: [5, 'panjang nama harus antara 5 - 250 karakter'],
        required: [true, 'name_product harus di isi']
    },
    price: {
        type: Number,
        required: [true, 'price harus di isi'],
        min: [3, 'price yang harus diisi setidaknya 100'],
    },
    total_price:{
        type: Number,
    },
    diskon: {
        type: Number,
        required: false,
    },
    description: {
        type: String,
        required: [true, 'deskripsi harus diisi']
    },
    image_product: {
        type: String,
        required: [true, 'product harus memiliki setidaknya 1 gambar']
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: User
    },
    warna:{
        type: String,
        required: false,
    },
    size:{
        type: String,
        enum:['small', 'medium', 'big']
    },
    categoryId:{
        type: String,
        enum:['makanan berat', 'makanan ringan', 'bahan mentah', 'bahan matang'],
        required: true,
    },
    varianRasa:{
        type: String,
        required: false,
    },
    rasaLevel:{
        type: Number,
        required: false,
    }
}, { timestamp: true })

//Check if there is discon for the product before save
productModels.pre('save', function(next){
    if(this.diskon){
        this.total_price = this.price - (this.price*this.diskon/100)
    }
    next()
})

//Check if there is discon for the product before update(edit)
productModels.pre('findOneAndUpdate', async function(next){
 const docToUpdate = this.getUpdate()
 await this.model.updateOne(this.getQuery(), { total_price: docToUpdate.price - (docToUpdate.price*docToUpdate.diskon/100) });
 next()
})

const Product = mongoose.model('Product', productModels)

module.exports = Product