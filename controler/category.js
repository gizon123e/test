const MainCategory = require('../models/model-main-category');
const SubCategory = require('../models/model-sub-category');
const SpecificCategory = require('../models/model-specific-category');
const path = require("path");
const dotenv = require('dotenv').config()
const randomIndex = require("../utils/randomIndex");
const { default: mongoose } = require('mongoose');

module.exports = {
    getCategory: async (req, res, next) => {
        try {
            const dataCategory = await MainCategory.find().populate({
                path: 'contents',
                populate: {
                    path: "contents",
                    module: "SpecificCategory"
                }
            })
            console.log(dataCategory.length)
            if (!dataCategory || dataCategory.length === 0) return res.status(404).json({ message: "Tidak Ada Category" });
            let data;
            const requestFrom = req.headers['user-agent'];
            if (requestFrom && requestFrom.includes("Mobile")) {
                console.log('masuk mobile')
                data = dataCategory.filter(item => item.showAt === "mobile" || item.showAt === "mobile dan web");
                if (data.length > 7) {
                    data = data.slice(0, 7);
                }
            } else if (requestFrom && requestFrom.includes("Web")) {
                data = dataCategory.filter(item => item.showAt === "web" || item.showAt === "mobile dan web");
                if (data.length > 9) {
                    data = data.slice(0, 9);
                }
            } else {
                data = dataCategory.filter(item => item.showAt === "all" || item.showAt === "web" || item.showAt === "mobile dan web" || item.showAt === "mobile");
            };
            return res.status(200).json({ message: `Berhasil Mendapatkan Kategori Untuk ${requestFrom}`, data });
        } catch (error) {
            console.log(error)
            next(error)
        };
    },

    getDetailCategory: async (req, res, next) => {
        try {
            const id = req.body.mainCategoryId
            const mainCategory = await MainCategory.findById(id).populate("contents");
            if (!mainCategory) return res.status(404).json({ message: `Main category dengan id ${id} tidak ditemukan` });
            return res.status(200).json({ message: "Berhasil mendapatkan detail main category", data: mainCategory })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getCategorySub: async (req, res, next) => {
        try {
            const data = await SubCategory.findById(req.params.id).populate("contents")
            if (!data) {
                return res.status(404).json({
                    message: "Sub Category not found",
                });
            }

            res.status(200).json({
                message: "get data Sub Category success",
                datas: data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createCategory: async (req, res, next) => {
        try {
            const { main, sub, specific, showAt } = req.body;
            let main_category;
            let sub_category
            let specific_category;
            main_category = await MainCategory.findOne({ name: { $regex: new RegExp(main, 'i') } }).populate("contents");
            if (req.files === undefined && !main_category && main) return res.status(400).json({ message: "Tidak ada file icon yang dikirimkan" })
            if (main && req.files) {
                const { icon } = req.files;
                const iconName = `${Date.now()}_${main}_${path.extname(icon.name)}`
                const pathIcon = path.join(__dirname, '../public', 'icon', iconName);
                await icon.mv(pathIcon)
                if (!main_category) {
                    main_category = await MainCategory.create({ name: main, showAt, icon: `${process.env.HOST}/public/icon/${iconName}` });
                };
            }

            if (sub) {
                const dataSubCategory = await SubCategory.findOne({ name: sub })
                sub_category = await SubCategory.findOne({ name: { $regex: new RegExp('^' + sub + '$', 'i') } });
                if (!dataSubCategory) {
                    if (!sub_category) {
                        sub_category = await SubCategory.create({ name: sub });
                    }
                    const check = main_category.contents.find(item => {
                        return item.toString() === sub_category._id.toString()
                    });
                    console.log(check)
                    if (!check) {
                        main_category.contents.push(sub_category._id);
                        await main_category.save();
                    }
                }

                console.log(sub)
            };

            if (specific) {
                specific_category = await SpecificCategory.findOne({ name: { $regex: new RegExp(specific, 'i') } });
                if (!specific_category) {
                    specific_category = await SpecificCategory.create({ name: specific });
                }

                sub_category.contents.push(specific_category._id);
                await sub_category.save();
            };

            return res.status(201).json({ message: "Berhasil Menambahkan Category", main_category, sub_category, specific_category });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updateSubCategory: async (req, res, next) => {
        try {
            const sub_category = await SubCategory.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
            if (!sub_category) return res.status(404).json({ message: `Sub Category dengan id ${req.body.id} tidak ditemukan` });
            return res.status(200).json({ message: "Berhasil Mengedit Sub Category", data: sub_category });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updateSpacific: async (req, res, next) => {
        try {
            const data = await SpecificCategory.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true })
            if (!data) return res.status(404).json({ message: `Specific Category dengan id ${req.params.id} tidak ditemukan` });
            return res.status(200).json({ message: "Berhasil Mengedit Specific Category", data });
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateCategory: async (req, res, next) => {
        try {
            const data = req.body;
            Object.keys(req.body).forEach(item => {
                if (!req.body[item] || req.body[item].trim().length === 0) return res.status(400).json({ message: `${item} tidak boleh string kosong` })
            });

            if (req.files && req.files.icon) {
                const { icon } = req.files
                const iconName = `${Date.now()}_${icon.name}_${path.extname(icon.name)}`
                const pathIcon = path.join(__dirname, '../public', 'icon', iconName);
                await icon.mv(pathIcon)

                data.icon = `${process.env.HOST}/public/icon/${iconName}`
            };

            const dataCategory = await MainCategory.findByIdAndUpdate(req.params.id, data, { new: true });
            return res.status(201).json({
                message: 'Update Category success',
                datas: dataCategory
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    deleteCategory: async (req, res, next) => {
        try {
            const dataCategory = await MainCategory.findOne({ _id: req.params.id });
            if (req.query.sub) {
                const sub_category = await SubCategory.findById(req.params.id);
                if (sub_category.contents.length > 0) return res.status(403).json({ message: "Sub Category memiliki specific category. Tidak Bisa Menghapus" })
                const main = await MainCategory.findOne({ contents: { $in: req.params.id } });
                if (main) {
                    const index = main.contents.indexOf(new mongoose.Types.ObjectId(req.params.id));
                    main.contents.splice(index, 1);
                    await main.save();
                }
                await SubCategory.deleteOne({ _id: req.params.id });
                if (!sub_category) {
                    return res.status(404).json({ message: `Sub Category dengan id ${req.params.id} tidak ditemukan` });
                } else {
                    return res.status(200).json({ message: "Berhasil Menghapus Sub Category" });
                };
            } else if (req.query.specific) {

                const specificCategory = await SpecificCategory.findById(req.params.id);
                if (!specificCategory) {
                    return res.status(404).json({ message: `Specific Category dengan id ${req.params.id} tidak ditemukan` });
                }
                const subCategory = await SubCategory.findOne({ contents: { $in: req.params.id } });

                if (!subCategory) {
                    return res.status(404).json({ message: `Sub Category dengan item ${req.params.id} tidak ditemukan` });
                }

                if (subCategory) {
                    subCategory.contents = subCategory.contents.filter(item => item._id.toString() !== req.params.id.toString());
                    await subCategory.save();
                }

                await SpecificCategory.deleteOne({ _id: req.params.id });
                return res.status(200).json({ message: "Berhasil Menghapus Specific Category" });
            }
            if (!dataCategory) return res.status(404).json({ message: 'delete data category not found' });
            if (dataCategory.contents.length > 0) return res.status(403).json({ message: `Tidak bisa menghapus category ${dataCategory.name}, karena sudah memiliki sub category` });

            await MainCategory.deleteOne({ _id: req.params.id });
            return res.status(200).json({ message: 'delete success' });
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}