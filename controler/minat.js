const Minat = require("../models/model-minat-user");
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
                minat.categoryMinat.push({categoryId});
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
            const minatUser = await Minat.findOne({userId: req.user.id});
            // const categoriesId = []
            // minatUser.categoryMinat.forEach(minat => {
            //     categoriesId.push(minat.categoryId)
            // });
            // const products = await Product.find({ categoryId : { $in: categoriesId }});
            return res.status(200).json({ message: "Berhasil Mendapatkan Minat User" , data: minatUser})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}