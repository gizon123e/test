const MainCategory = require('../models/model-main-category');
const SubCategory = require('../models/model-sub-category');
const SpecificCategory = require('../models/model-specific-category');
const path = require("path");
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
            if (!dataCategory || dataCategory.length === 0) return res.status(404).json({ message: "Tidak Ada Category" });
            let data;
            const requestFrom = req.headers['user-agent'];
            if (requestFrom && requestFrom === "Mobile") {
                data = dataCategory.filter(item => item.showAt === "mobile" || item.showAt === "mobile dan web");
            } else if (requestFrom && requestFrom === "Web") {
                data = dataCategory.filter(item => item.showAt === "web" || item.showAt === "mobile dan web")
            } else {
                data = dataCategory
            };
            switch (req.user.role) {
                case "konsumen":
                    data = data.filter(item => item.for === "konsumen");
                    break;
                case "vendor":
                    data = data.filter(item => item.for === "vendor");
                    break;
                case "supplier":
                    data = data.filter(item => item.for === "supplier");
                    break;
                case "produsen":
                    data = data.filter(item => item.for === "produsen");
                    break;
            }
            function firstIndex(array) {
                const index = array.findIndex(item => item.name === 'makanan & minuman')
                if (index > -1) {
                    const [item] = array.splice(index, 1)
                    array.unshift(item)
                }
                if (requestFrom && requestFrom === "Mobile") {
                    return array.slice(0,9);
                } else if (requestFrom && requestFrom === "Web") {
                    return array.slice(0,9);
                }else{
                    return array
                }
            }
            return res.status(200).json({ message: `Berhasil Mendapatkan Kategori Untuk ${requestFrom}`, data: firstIndex(data) });
        } catch (error) {
            console.log(error);
            next(error);
        };
    },

    getAllMainCategory: async (req, res, next) => {
        try {
            const data = await MainCategory.aggregate([
                { $match: {} },
                {
                    $project: { _id: 1, name: 1, for: 1, contents: 1 }
                },
                {
                    $lookup:{
                        from: 'subcategories',
                        let: { subs: "$contents" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in : [ "$_id", "$$subs" ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1,
                                    _id: 1
                                }
                            }
                        ],
                        as: 'sub_categories'
                    }
                },
                { 
                    $addFields: {
                        contents: "$sub_categories"
                    }
                },
                {
                    $project : { sub_categories: 0 }
                }
            ]);
            let finalData
            switch (req.user.role) {
                case "vendor":
                    finalData = data.filter(item => { return item.for === "konsumen"});
                    break;
                case "supplier":
                    finalData = data.filter(item => { return item.for === "vendor"});
                    break;
                case "produsen":
                    finalData = data.filter(item => { return item.for === "supplier"});
                    break;
            };
            return res.status(200).json({ message: "Berhasil Mendapatkan Semua Category", data: finalData });

        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getDetailMainCategory: async (req, res, next) => {
        try {
            const id = req.params.id
            const mainCategory = await MainCategory.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "subcategories",
                        let: { subId: "$contents" },
                        pipeline: [
                            { $match: { $expr: { $in: ["$_id", "$$subId"] } } },
                            { $project: { contents: 0, __v: 0 } }
                        ],
                        as: "sub_categories"
                    }
                },
                {
                    $project: { contents: 0, icon: 0, showAt: 0, for: 0, __v: 0 }
                }
            ])
            if (!mainCategory || mainCategory.length === 0) return res.status(404).json({ message: `Main category dengan id ${id} tidak ditemukan` });
            return res.status(200).json({ message: "Berhasil mendapatkan detail main category", data: mainCategory[0] })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getCategorySub: async (req, res, next) => {
        try {
            const data = await SubCategory.findById(req.params.id).populate({
                path: "contents",
                select: 'name _id'
            })
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
            const { main, sub, specific, showAt, forShow } = req.body;
            let main_category;
            let sub_category
            let specific_category;
            main_category = await MainCategory.findOne({ name: { $regex: new RegExp(`^${main}$`, 'i') } }).populate("contents");
            if (req.files === undefined && !main_category && main) return res.status(400).json({ message: "Tidak ada file icon yang dikirimkan" })
            if (main && req.files) {
                const { icon } = req.files;
                const iconName = `${Date.now()}_${main}_${path.extname(icon.name)}`
                const pathIcon = path.join(__dirname, '../public', 'icon', iconName);
                await icon.mv(pathIcon)
                if (!main_category) {
                    main_category = await MainCategory.create({ name: main, showAt, icon: `${process.env.HOST}/public/icon/${iconName}`, for: forShow });
                };
            }

            if (sub) {
                sub_category = await SubCategory.findOne({ name: { $regex: new RegExp(`^${sub}$`, 'i') } });
                if (!sub_category) {
                    sub_category = await SubCategory.create({ name: sub });
                }
                const check = main_category.contents.find(item => {
                    return item._id.equals(sub_category._id);
                });
                if (!check) {
                    const id = main_category._id
                    main_category = await MainCategory.findByIdAndUpdate(id, { $push: { contents: sub_category._id } }, { new: true });
                }
            };

            if (specific) {
                specific_category = await SpecificCategory.findOne({ name: { $regex: new RegExp(`^${specific}$`, 'i') } });
                if (!specific_category) {
                    specific_category = await SpecificCategory.create({ name: specific });
                }
                const check = sub_category.contents.find(item => {
                    return item._id.equals(specific_category._id);
                });
                if (!check || check.length < 0) {
                    const id = sub_category._id
                    sub_category = await SubCategory.findByIdAndUpdate(id, { $push: { contents: specific_category._id } }, { new: true });
                }
            };
            console.log(req.body)

            return res.status(201).json({ message: "Berhasil Menambahkan Category", main_category, sub_category, specific_category });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getAllSpecificCategory: async (req, res, next) => {
        try {
            let categories = await SpecificCategory.aggregate([
                {
                    $project: {
                        _id: 1,
                        name: 1
                    }
                }
            ]);
            if (req.headers["user-agent"] == "web") categories = await SpecificCategory.find({ show_at_web: true })
            return res.status(200).json({ message: "Berhasil Mendapatkan Semua Specific Category", data: categories });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    editShowSpecificCategory: async (req, res, next) => {
        try {
            if (req.user.role !== "administrator") return res.status(403).json({ message: "Ngedit Category hanya cuman boleh sama admin!" })

            const edited = await SpecificCategory.findByIdAndUpdate(req.params.id, {
                show_at_web: true
            }, { new: true })

            return res.status(200).json({ message: "Berhasil Mengedit Specific Category", data: edited })
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
            console.log(data)
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
                if (sub_category.contents.length > 1) return res.status(403).json({ message: "Sub Category memiliki specific category. Tidak Bisa Menghapus" })
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
                const specific_category = await SpecificCategory.findById(req.params.id);
                const sub_category = await SubCategory.findOne({ contents: { $in: req.params.id } });
                if (sub_category) {
                    const index = sub_category.contents.indexOf(new mongoose.Types.ObjectId(req.params.id));
                    sub_category.contents.splice(index, 1);
                    await sub_category.save();
                }
                await SpecificCategory.deleteOne({ _id: req.params.id });
                if (!specific_category) {
                    return res.status(404).json({ message: `Specific Category dengan id ${req.params.id} tidak ditemukan` });
                } else {
                    return res.status(200).json({ message: "Berhasil Menghapus Specific Category" });
                };
            }
            if (!dataCategory) return res.status(404).json({ message: 'delete data category not found' });
            if (dataCategory.contents.length > 1) return res.status(403).json({ message: `Tidak bisa menghapus category ${dataCategory.name}, karena sudah memiliki sub category` });

            await MainCategory.deleteOne({ _id: req.params.id });
            return res.status(200).json({ message: 'delete success' });
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}