const FlashSale = require("../models/model-flashsale");
const SpecificCategory = require("../models/model-specific-category");
const Product = require("../models/model-product");
const createDate = require('../utils/createDateString');

module.exports = {
    addFlashSale: async(req, res, next) => {
        try {
            const { categoryIds = [], potonganHarga, start, end } = req.body
            
            const categorys = await SpecificCategory.find({_id: { $in: categoryIds }});
            // console.log(categorys)
            const idCategorys = []
            categorys.forEach(item => {
                idCategorys.push(item._id.toString());
            })
            categoryIds.forEach(item => {
                if(!idCategorys.includes(item)) return res.status(404).json({message: `Category dengan id ${item} tidak ditemukan`});
            })
            const mappedCategorys = categorys.map(item => ({ value: item._id }));

            console.log('mapped', mappedCategorys)
            // console.log(start, end);
            // console.log(createDate(start).toString(), createDate(end).toString())
            const startTime = createDate(start);
            const endTime = createDate(end);
            const newFlashSale = await FlashSale.create({
                categoryId: mappedCategorys,
                startTime,
                endTime,
                potonganHarga
            });

            return res.status(201).json({message: "Berhasil Menambahkan Flash Sale", data: newFlashSale});

        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getFlashSale: async(req, res, next) => {
        try {
            const flashSales = await FlashSale.find()
            const flashSalesProducts = []
            const data = []
            let categorys = [];
            for ( const flashSale of flashSales){
                categorys = flashSale.categoryId
                for (const item of categorys){
                    const product = await Product.findOne({categoryId: item.value.toString()});
                    flashSalesProducts.push(product);
                }
                const object = flashSale.toObject()
                delete object.categoryId
                data.push({object, flashSalesProducts})
            }
            

            return res.status(200).json({message: "Berhasil mendapatkan flash sale", data});
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}