const Minat = require("../models/model-minat-user");
const mongoose = require('mongoose')
const Product = require("../models/model-product");

module.exports = {
    addMinat: async (req, res, next) => {
        try {
            const { categoryId } = req.body
            let minat = await Minat.findOne({userId: req.user.id});
            if(!minat){
                minat = await Minat.create({
                    userId: req.user.id,
                    categoryMinat: [{categoryId}]
                });
            }else{
                const ada = minat.categoryMinat.some(item => item.categoryId === categoryId)
                if(!ada) minat.categoryMinat.push({categoryId});
            }
            await minat.save();

            return res.status(200).json({message: "Berhasil Menambahkan Minat User", data: minat});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getMinat: async (req, res, next) => {
        try {
            console.log(req.user.id)
            const minatUser = await Minat.findOne({userId: req.user.id}).populate({
                path: 'categoryMinat.categoryId'
            })
            return res.status(200).json({ message: "Berhasil Mendapatkan Minat User" , data: minatUser})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}