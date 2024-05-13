const MainCategory = require('../models/model-main-category');
const SubCategory = require('../models/model-sub-category');
const SpecificCategory = require('../models/model-specific-category');


module.exports = {
    getCategory: async (req, res, next) => {
        try {
            const dataCategory = await MainCategory.find().populate({
                path: "contents",
                populate:{
                    path: "contents",
                    model: "SpecificCategory"
                }
            })
            
            return res.status(200).json({ datas: dataCategory })
        } catch (error) {
            res.status(500).json({
                error,
                message: "Internal Error Server"
            })
        }
    },

    createCategory: async (req, res, next) => {
        try {
            const { main, sub, specific } = req.body;
            let main_category;
            let sub_category
            let specific_category;

            if(main){
                main_category = await MainCategory.findOne({ name: { $regex: new RegExp(main, 'i')}});
                if(!main_category){
                    main_category = await MainCategory.create({name: main});
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
            
            return res.status(201).json({message: "Berhasil Menambahkan Category"});
        } catch (error) {
            console.log(error)
            next(error)
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
            const dataCategory = await SpecificCategory.findByIdAndUpdate({ _id: req.params.id }, { name: req.body.name }, { new: true })
            return res.status(201).json({
                message: 'Update Category success',
                datas: dataCategory
            })
        } catch (error) {
            res.status(500).json({
                error,
                message: "Internal Error Server"
            })
        }
    },

    deleteCategory: async (req, res, next) => {
        try {
            const dataCategory = await SpecificCategory.findOne({ _id: req.params.id })
            if (!dataCategory) return res.status(404).json({ message: 'delete data category not found' })

            await Category.deleteOne({ _id: req.params.id })
            return res.status(200).json({ message: 'delete success' })
        } catch (error) {
            res.status(500).json({
                error,
                message: "Internal Error Server"
            })
            next(error)
        }
    }
}