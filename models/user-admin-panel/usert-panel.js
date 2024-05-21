const mongoose = require('mongoose')

const modelUserAdminPanel = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username harus di isi"],
        minlength: [5, "panjang Username harus di antara 3 - 250 karakter"],
    },
    password: {
        type: String,
        required: [true, "Password harus di isi"],
        maxlength: [250, "panjang password harus di antara 3 - 250 karakter"],
        minlength: [5, "panjang password harus di antara 3 - 250 karakter"],
    },
    role: {
        type: String,
        enum: ["administrator", "oprator"],
        message: "{VALUE} is not supported",
        required: [true, 'Role harus di isi']
    }
})

const UserAdminPanel = mongoose.model('UserAdminPanel', modelUserAdminPanel)

module.exports = UserAdminPanel