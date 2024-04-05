const Product = require('../models/model-product')
const User = require("../models/model-auth-user")
const Pesanan = require("../models/model-pesanan")
module.exports= {
    make: (req, res, next) => {
        try {
            const data = req.body
            Pesanan.create({data}).then(()=>{

            })
        } catch (error) {
            
        }
    }
}