const FlashSale = require("../models/model-flashsale");
const SpecificCategory = require("../models/model-specific-category");
const Product = require("../models/model-product");
const Supplier = require("../models/supplier/model-supplier");
const Produsen = require("../models/produsen/model-produsen")
const Vendor = require("../models/vendor/model-vendor")
const createDate = require('../utils/createDateString');

module.exports = {
    addFlashSale: async(req, res, next) => {
        try {
            console.time('test')
            const { categoryIds = [], potonganHarga, start, end } = req.body
            
            const categorys = await SpecificCategory.find({_id: { $in: categoryIds }});
            const productFlashSale = await Product.find({categoryId: {$in: categoryIds}});
            const productIds = []
            for (const product of productFlashSale){
                productIds.push(product._id)
            }
            await Product.updateMany(
                {_id: {$in: productIds}},
                { $set: { isFlashSale: true }}
            );
            const idCategorys = []
            categorys.forEach(item => {
                idCategorys.push(item._id.toString());
            })
            categoryIds.forEach(item => {
                if(!idCategorys.includes(item)) return res.status(404).json({message: `Category dengan id ${item} tidak ditemukan`});
            })
            const mappedCategorys = categorys.map(item => ({ value: item._id }));

            const startTime = createDate(start);
            const endTime = createDate(end);
            const newFlashSale = await FlashSale.create({
                nama: req.body.nama,
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
            if(!flashSales || flashSales.length === 0) return res.status(404).json({message: "no-start"})
            const flashSalesProducts = []
            const data = []
            let categorys = [];
            for ( const flashSale of flashSales){
                categorys = flashSale.categoryId
                for (const item of categorys){
                    const product = await Product.findOne({categoryId: item.value.toString()}).populate({
                        path: 'userId',
                        select: '-pin -password'
                    });
                    let toko;
                    const stokAwalEntry = flashSale.stokAwal.find(entry => entry.productId.toString() === product._id.toString());
                    if (stokAwalEntry) {
                        stokAwal = stokAwalEntry.value;
                    } else {
                        stokAwal = product.stok;
                        flashSale.stokAwal.push({ productId: product._id, value: stokAwal });
                        await flashSale.save();
                    };
                    switch(product.userId.role){
                        case "vendor":
                            toko = await Vendor.findOne({userId: product.userId._id}).select('-nomorAktaPerusahaan -npwpFile -legalitasBadanUsaha -nomorNpwpPerusahaan').populate('address');
                            break;
                        case "supplier":
                            toko = await Supplier.findOne({userId: product.userId._id}).select('-nomorAktaPerusahaan -npwpFile -legalitasBadanUsaha -nomorNpwpPerusahaan').populate('address');
                            break;
                        case "produsen":
                            toko = await Produsen.findOne({userId: product.userId._id}).select('-nomorAktaPerusahaan -npwpFile -legalitasBadanUsaha -nomorNpwpPerusahaan').populate('address');
                            break;
                    }
                    const objectProduct = product.toObject();
                    flashSalesProducts.push({...objectProduct, stokAwal, toko});
                }
                const object = flashSale.toObject()
                delete object.categoryId
                if(flashSale.endTime.getTime() < new Date().getTime()) return res.status(403).json({message: "Flash Sale Sudah Berakhir"});
                data.push({ flash_sale: object, flashSalesProducts})
            }
            

            return res.status(200).json({message: "Berhasil mendapatkan flash sale", data});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    deleteFlashSale: async(req, res, next) =>{
        try {
            const id = req.params.id
            const fs = await FlashSale.findById(id);
            if(new Date(fs.startTime) < new Date() && new Date(fs.endTime) > new Date()) return res.status(403).json({message: "Tidak Bisa Menghapus Flash Sale yang sedang Berlangsung"})
            await FlashSale.deleteOne({_id: id})
            return res.status(200).json({message: "Berhasil Menghapus Flash Sale"});
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getFlashSaleAdmin: async(req, res, next) => {
        try {
            const fs = await FlashSale.find()
            return res.status(200).json({data: fs})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}