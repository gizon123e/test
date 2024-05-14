const MainCategory = require('../models/model-main-category');
const SubCategory = require('../models/model-sub-category');
const SpecificCategory = require('../models/model-specific-category');
const path = require("path");
const dotenv = require('dotenv').config()
const randomIndex = require("../utils/randomIndex");


module.exports = {
    getCategory: async (req, res, next) => {
        try {
            const dataCategory = await MainCategory.find()
            if(!dataCategory || dataCategory.length === 0) return res.status(404).json({message: "Tidak Ada Category"});
            let data;
            const requestFrom = req.headers['user-agent'];
            if(requestFrom.includes("Mobile")){
                data = dataCategory.filter(item => item.showAt === "mobile" || "mobile dan web");
                if(data.length > 7){
                    data = data.slice(0,7);
                }
            }else if(requestFrom.includes("Web")){
                data = dataCategory.filter(item => item.showAt === "web" || "mobile dan web");
            }else{
                data = dataCategory;
            };
            return res.status(200).json({ message: `Berhasil Mendapatkan Kategori Untuk ${requestFrom}`, data });
        } catch (error) {
            console.log(error)
            next(error)
        };
    },

    getDetailCategory: async(req, res, next) => {
        try {
            const id = req.body.mainCategoryId
            const mainCategory = await MainCategory.findById(id).populate({
                path: contents,
                model:"SubCategory"
            });
            if(!mainCategory) return res.status(404).json({message: `Main category dengan id ${id} tidak ditemukan`});
            return res.status(200).json({message: "Berhasil mendapatkan detail main category", data: mainCategory})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    createCategory: async (req, res, next) => {
        try {
            const { main, sub, specific, showAt } = req.body;
            if(req.files === undefined) return res.status(400).json({message: "Tidak ada file icon yang dikirimkan"})
            const { icon } = req.files
            let main_category;
            let sub_category
            let specific_category;

            if(main){
                const iconName = `${Date.now()}_${icon.name}_${path.extname(icon.name)}`
                const pathIcon = path.join(__dirname, '../public', 'icon', iconName);
                await icon.mv(pathIcon)
                main_category = await MainCategory.findOne({ name: { $regex: new RegExp(main, 'i')} });
                if(!main_category){
                    main_category = await MainCategory.create({name: main, showAt, icon: `${process.env.HOST}/public/icon/${iconName}`});
                };
            }

            if(sub){
                sub_category = await SubCategory.findOne({ name: { $regex: new RegExp('^' + sub + '$', 'i')}});
                console.log(sub_category)
                if(!sub_category){
                    sub_category = await SubCategory.create({name: sub});
                }
                main_category.contents.push(sub_category._id);
                await main_category.save();
            }

            if(specific){
                specific_category = await SpecificCategory.findOne({ name: { $regex: new RegExp(specific, 'i')}});
                if(!specific_category){
                    specific_category = await SpecificCategory.create({name: specific});
                }
                sub_category.contents.push(specific_category._id);
                await sub_category.save();
            }
            
            return res.status(201).json({message: "Berhasil Menambahkan Category", main_category, sub_category, specific_category});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    // createCategory: async (req, res, next) => {
    //     try {
    //         const data = []
    //         const { dataCategory } = req.body;
    //         if(!dataCategory) return res.status(400).json({message: "dibutuhkan payload dataCategory yang berisi array of object"});
    //         if(!Array.isArray(dataCategory)) return res.status(400).json({message: "dataCategory harus array of object"});

    //         for (const category of dataCategory) {
    //             let mainCategory = await MainCategory.findOne({ name: { $regex: new RegExp(category.category, 'i') } });
        
    //             let subCategory;
    //             if (!mainCategory) {
    //                 mainCategory = await MainCategory.create({ name: category.category });
    //                 subCategory = await SubCategory.findOne({ name: { $regex: new RegExp(category.productCategory, 'i') } });
    //                 if (!subCategory) {
    //                     subCategory = await SubCategory.create({ name: category.productCategory });
    //                     mainCategory.contents.push(subCategory._id);
    //                     await mainCategory.save();
    //                 }else if(subCategory && !mainCategory.contents.includes(subCategory._id)){
    //                     mainCategory.contents.push(subCategory._id);
    //                     await mainCategory.save();
    //                 }
    //             } else {
    //                 subCategory = await SubCategory.findOne({ name: { $regex: new RegExp(category.productCategory, 'i') } });
    //                 if (!subCategory) {
    //                     subCategory = await SubCategory.create({ name: category.productCategory });
    //                     mainCategory.contents.push(subCategory._id);
    //                     await mainCategory.save();
    //                 }else if(subCategory && !mainCategory.contents.includes(subCategory._id)){
    //                     mainCategory.contents.push(subCategory._id);
    //                     await mainCategory.save();
    //                 }
    //             }
        
    //             let specificCategory;
    //             if (subCategory) {
    //                 specificCategory = await SpecificCategory.findOne({ name: { $regex: new RegExp(category.product, 'i') } });
    //                 if (!specificCategory) {
    //                     specificCategory = await SpecificCategory.create({ name: category.product });
    //                     subCategory.contents.push(specificCategory._id);
    //                     await subCategory.save();
    //                 }else if( specificCategory && !subCategory.contents.includes(specificCategory._id)){
    //                     subCategory.contents.push(specificCategory._id);
    //                     await subCategory.save();
    //                 }
    //             }
        
    //             data.push({ mainCategory, subCategory, specificCategory });
    //         };

    //         return res.status(201).json({ message: "Berhasil membuat Category", data })
    //     } catch (error) {
    //         console.log(error);
    //         next(error);
    //     }
    // },

    updateCategory: async (req, res, next) => {
        try {
            const dataCategory = await MainCategory.findByIdAndUpdate( req.params.id , { name: req.body.name }, { new: true })
            return res.status(201).json({
                message: 'Update Category success',
                datas: dataCategory
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    deleteCategory: async (req, res, next) => {
        try {
            const dataCategory = await MainCategory.findOne({ _id: req.params.id })
            if (!dataCategory) return res.status(404).json({ message: 'delete data category not found' });
            if(dataCategory.contents.length > 0) return res.status(403).json({message: `Tidak bisa menghapus category ${dataCategory.name}, karena sudah memiliki sub category`});

            await MainCategory.deleteOne({ _id: req.params.id });
            return res.status(200).json({ message: 'delete success' });
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}