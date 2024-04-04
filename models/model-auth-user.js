const mongoose = require('mongoose')

const userModels = mongoose.Schema({
    username: {
        type: String,
        maxlength: [250, 'panjang nama harus antara 3 - 250 karakter'],
        minlength: [3, 'panjang nama harus antara 3 - 250 karakter'],
        required: [true, 'full_name harus di isi']
    },
    email: {
        type: String,
        required: [true, 'email harus di isi'],
        maxlength: [250, 'panjang email harus di antara 3 - 250 karakter'],
        validate: {
            validator: (email) => {
                const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/
                return emailRegex.test(email)
            },
            message: (props) => `${props.value} email tidak valid`
        }
    },
    password: {
        type: String,
        required: [true, 'password harus di isi'],
        maxlength: [250, 'panjang password harus di antara 3 - 250 karakter'],
        minlength: [3, 'panjang password harus di antara 3 - 250 karakter']
    },
    role: {
        type: String,
        enum: ['seller', 'user', 'distributor', 'vendor'],
        message: '{VALUE} is not supported',
        default: 'user'
    }
}, { temestamp: true })

const User = mongoose.model('User', userModels)

module.exports = User