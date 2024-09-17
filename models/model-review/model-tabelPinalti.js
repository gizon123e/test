const mongoose = require('mongoose')

const modelUserPinalti = new mongoose.Schema({
// id_
}, { timestamps: true })

const UserPinalti = mongoose.model('UserPinalti', modelUserPinalti)