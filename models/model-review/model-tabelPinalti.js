const mongoose = require('mongoose')

const modelUserPinalti = new mongoose.Schema({

}, { timestamps: true })

const UserPinalti = mongoose.model('UserPinalti', modelUserPinalti)