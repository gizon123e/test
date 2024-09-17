require('../database/database')
const User = require('../models/model-user-system');
const bcrypt = require('bcrypt')

const password = bcrypt.hash("lexi123", 10).then((password)=>{
    User.create({username: "lexi", password}).then(()=>{
        console.log("Berhasil membuat system user")
    })
})
