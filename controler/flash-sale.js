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
            const stokAwalMap = new Map()
            const flashSales = await FlashSale.find()
            if(!flashSales || flashSales.length === 0) return res.status(404).json({message: "no-event"})
            const flashSalesProducts = []
            const data = []
            let categorys = [];
            for ( const flashSale of flashSales){
                categorys = flashSale.categoryId
                for (const item of categorys){
                    let stokAwal;
                    const product = await Product.findOne({categoryId: item.value.toString()});
                    if(!stokAwalMap.get(product._id.toString())){
                        stokAwalMap.set(product._id.toString(), product.stok);
                        stokAwal = stokAwalMap.get(product._id.toString())
                    }else{
                        stokAwal = stokAwalMap.get(product._id.toString())
                    }
                    if(!stokAwal) stokAwal = product.stok
                    const objectProduct = product.toObject();
                    flashSalesProducts.push({...objectProduct, stokAwal});
                }
                const object = flashSale.toObject()
                delete object.categoryId
                if(flashSale.endTime.getTime() < new Date().getTime()) return res.status(403).jons({message: "Flash Sale Sudah Berakhir"});
                data.push({ flash_sale: object, flashSalesProducts})
            }
            

            return res.status(200).json({message: "Berhasil mendapatkan flash sale", data});
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}