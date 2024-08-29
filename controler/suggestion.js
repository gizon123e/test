const Address = require("../models/model-address");
const BiayaTetap = require("../models/model-biaya-tetap");
const Suggestion = require("../models/model-suggestion");
const TokoSupplier = require("../models/supplier/model-toko");
const TokoVendor = require("../models/vendor/model-toko");
const { calculateDistance } = require("../utils/menghitungJarak");

module.exports = {
    getSuggestion: async(req, res, next) => {
        try {
            const { name } = req.query
            const datas = await Suggestion.find({
                nama: { $regex: new RegExp(name, "i") }
            }).limit(10);

            const address_user = await Address.findOne({userId: req.user.id, isUsed: true}).select("pinAlamat")

            const biayaTetap = await BiayaTetap.findById("66456e44e21bfd96d4389c73").select("radius")

            let toko;

            switch(req.user.role){
                case "konsumen":
                    toko = await TokoVendor.aggregate([
                        {
                            $match: {
                                namaToko: { $regex: new RegExp(name, "i") }
                            }
                        },
                        {
                            $lookup: {
                                from: 'addresses',
                                let: { address: "$address" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$address"]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            pinAlamat: 1
                                        }
                                    }
                                ],
                                as: 'address_detail'
                            }
                        },
                        {
                            $unwind: "$address_detail"
                        },
                        {
                            $lookup: {
                                from: 'products',
                                let: { userId: "$userId" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$userId", "$$userId"]
                                            },
                                            'status.value': 'terpublish'
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1
                                        }
                                    }
                                ],
                                as: 'products'
                            }
                        },
                        {
                            $match: {
                                products: { $ne: [] }
                            }
                        }
                    ]);
                    break;
                case "vendor":
                    toko = await TokoSupplier.aggregate([
                        {
                            $match: {
                                namaToko: { $regex: new RegExp(name, "i") }
                            }
                        },
                        {
                            $lookup: {
                                from: 'addresses',
                                let: { address: "$address" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$address"]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            pinAlamat: 1
                                        }
                                    }
                                ],
                                as: 'address_detail'
                            }
                        },
                        {
                            $unwind: "$address_detail"
                        },
                        {
                            $lookup: {
                                from: 'products',
                                let: { userId: "$userId" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$userId", "$$userId"]
                                            },
                                            'status.value': 'terpublish'
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1
                                        }
                                    }
                                ],
                                as: 'products'
                            }
                        },
                        {
                            $match: {
                                products: { $ne: [] }
                            }
                        }
                    ]);
                    break
                default:
                    toko = await TokoVendor.aggregate([
                        {
                            $match: {
                                namaToko: { $regex: new RegExp(name, "i") }
                            }
                        },
                        {
                            $lookup: {
                                from: 'addresses',
                                let: { address: "$address" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$address"]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            pinAlamat: 1
                                        }
                                    }
                                ],
                                as: 'address_detail'
                            }
                        },
                        {
                            $unwind: "$address_detail"
                        },
                        {
                            $lookup: {
                                from: 'products',
                                let: { userId: "$userId" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$userId", "$$userId"]
                                            },
                                            'status.value': 'terpublish'
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1
                                        }
                                    }
                                ],
                                as: 'products'
                            }
                        },
                        {
                            $match: {
                                products: { $ne: [] }
                            }
                        }
                    ]);
                    break;
            }

            const data = await Promise.all(
                toko.map(async (toko) => {
                    const jarak = await calculateDistance(
                        parseFloat(toko.address_detail.pinAlamat.lat),
                        parseFloat(toko.address_detail.pinAlamat.long),
                        parseFloat(address_user.pinAlamat.lat),
                        parseFloat(address_user.pinAlamat.long),
                        biayaTetap.radius
                    );
                    if (!isNaN(jarak)) {
                        const { namaToko, profile_pict, userId } = toko;
                        return {
                            namaToko,
                            profile_pict,
                            userId
                        };
                    }
                    return null; // Jika tidak memenuhi syarat, return null
                })
            );
            
            // Filter hasil untuk menghilangkan nilai null
            const filteredData = data.filter(toko => toko !== null);

            return res.status(200).json({ datas, toko: filteredData })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}