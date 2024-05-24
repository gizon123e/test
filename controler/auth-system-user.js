const User = require("../models/model-auth-user");
const Vendor = require('../models/vendor/model-vendor');
const Supplier = require('../models/supplier/model-supplier');
const Konsumen = require('../models/konsumen/model-konsumen');
const Produsen = require('../models/produsen/model-produsen');
const UserSystem = require("../models/model-user-system");
const jwt = require("../utils/jwt")
const bcrypt = require('bcrypt')
module.exports = {
    login: async(req, res, next)=>{
        try {
           const { username, password } = req.body;
           const user = await UserSystem.findOne({username})
           if(!user) return res.status(404).json({message: "User tidak ada"});
           const payloadToken = {
                id: user._id,
                username: user.username,
                role: user.role
           }
           const token = jwt.createToken(payloadToken);
           const validPassword = await bcrypt.compare(password, user.password);
           if(!validPassword) return res.status(401).json({message:"Password Salah"});
           return res.status(200).json({message: "Login Berhasil", token})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllUser: async(req, res, next) =>{
        try {
            if(req.user.role !== "administrator") return res.status(403).json({message: "Hanya Admin yang boleh akses!"});

            const data = await User.aggregate([
                {
                    $match: {
                        role: { $in: ["konsumen", "vendor", "supplier", "produsen", "distributor"]}
                    },
                },
                {
                    $group:{
                        _id: "$role",
                        userIds: { $push: "$_id"}
                    }
                },
            ])
            const userKonsumen = [];
            const userVendor = [];
            const userSupplier = [];
            const userProdusens = [];
            for (const group of data){
                if (group._id === 'konsumen') {
                    const konsumenDetails = await Konsumen.find({ userId: { $in: group.userIds } }).populate("userId");
                    for ( const user of konsumenDetails ){
                        if(user.namaBadanUsaha && !user.nama){
                            userKonsumen.push({ 
                                Nama_Lengkap: user.namaBadanUsaha, 
                                Jenis: "Company", 
                                userAuth: user.userId
                            })
                        }else if (user.nama && !user.namaBadanUsaha){
                            userKonsumen.push({ 
                                Nama_Lengkap: user.nama, 
                                Jenis: "Individu", 
                                userAuth: user.userId
                            })
                        }
                    }
                } else if (group._id === 'vendor') {
                    const vendorDetails = await Vendor.find({ userId: { $in: group.userIds } }).populate("userId");
                    for ( const user of vendorDetails ){
                        if(user.namaBadanUsaha && !user.nama){
                            userVendor.push({ 
                                Nama_Lengkap: user.namaBadanUsaha, 
                                Jenis: "Company", 
                                userAuth: user.userId
                            })
                        }else if (user.nama && !user.namaBadanUsaha){
                            userVendor.push({ 
                                Nama_Lengkap: user.nama, 
                                Jenis: "Individu", 
                                userAuth: user.userId
                            })
                        }
                    }
                } else if(group._id === 'supplier') {
                    const supplierDetails = await Supplier.find({ userId: { $in: group.userIds } }).populate("userId");
                    for ( const user of supplierDetails ){
                        if(user.namaBadanUsaha && !user.nama){
                            userSupplier.push({ 
                                Nama_Lengkap: user.namaBadanUsaha, 
                                Jenis: "Company", 
                                userAuth: user.userId
                            })
                        }else if (user.nama && !user.namaBadanUsaha){
                            userSupplier.push({ 
                                Nama_Lengkap: user.nama, 
                                Jenis: "Individu", 
                                userAuth: user.userId
                            })
                        }
                    }
                } else if(group._id === "produsen"){
                    const produsenDetails = await Produsen.find({ userId: { $in: group.userIds } }).populate("userId");
                    for ( const user of produsenDetails ){
                        if(user.namaBadanUsaha && !user.nama){
                            userProdusens.push({ 
                                Nama_Lengkap: user.namaBadanUsaha, 
                                Jenis: "Company", 
                                userAuth: user.userId
                            })
                        }else if (user.nama && !user.namaBadanUsaha){
                            userProdusens.push({ 
                                Nama_Lengkap: user.nama, 
                                Jenis: "Individu", 
                                userAuth: user.userId
                            })
                        }
                    }
                }
            };

            return res.status(200).json({
                message: "Berhasil Mendapatkan Semua User",
                konsumen: userKonsumen,
                vendor: userVendor,
                supplier: userSupplier,
                produsen: userProdusens
            });
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    editUser: async(req, res, next) =>{
        try {
            const id = req.params.id;
            let userAuth;
            let detail;
            const data = req.body
            const allowed = ["nama", "namaBadanUsaha", "role", "phone", "email"];
            Object.keys(data).forEach(item =>{
                if(!allowed.includes(item) && item !== "model") return res.status(403).json({message:"Tidak bisa mengubah properti " + item })
            });
            if(data.nama || data.namaBadanUsaha){
                delete data.email;
                delete data.role;
                delete data.phone;
                switch(data.model){
                    case "konsumen":
                        detail = await Konsumen.findOneAndUpdate({ userId: id }, data, {new: true});
                        break;
                    case "vendor":
                        detail = await Vendor.findOneAndUpdate({ userId: id }, data, {new: true});
                        break;
                    case "supplier":
                        detail = await Supplier.findOneAndUpdate({ userId: id }, data, {new: true});
                        break;
                    case "produsen":
                        detail = await Produsen.findOneAndUpdate({ userId: id }, data, {new: true});
                        break;
                };
            }else if(data.role || data.email || data.phone){
                delete data.nama;
                delete data.namaBadanUsaha;
                let detail
                userAuth = await User.findById(id)
                switch(userAuth.role){
                    case "konsumen":
                        detail = await Konsumen.findOne({userId: userAuth._id});
                        await Konsumen.findOneAndDelete({userId: userAuth._id});
                        break;
                    case "vendor":
                        detail = await Vendor.findOne({userId: userAuth._id});
                        await Vendor.findOneAndDelete({userId: userAuth._id});
                        break;
                    case "supplier":
                        detail = await Supplier.findOne({userId: userAuth._id});
                        await Supplier.findOneAndDelete({userId: userAuth._id});
                        break;
                    case "produsen": 
                        detail = await Produsen.findOne({userId: userAuth._id})
                        await Produsen.findOneAndDelete({userId: userAuth._id});
                        break;
                }

                switch(data.role){
                    case "konsumen":
                        await Konsumen.create(detail);
                        break;
                    case "vendor":
                        await Vendor.create(detail);
                        break;
                    case "supplier":
                        await Supplier.create(detail);
                        break;
                    case "produsen": 
                        await Produsen.create(detail);
                        break;
                }
            }

            return res.status(200).json({message: "Berhasil Mengubah Data User", data: {
                userAuth,
                detail
            }});

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    verifyOrBlockUser: async(req, res, next) =>{
        try {
            let user;
            const { block , verify } = req.body;
            if(block){
                user = await User.findByIdAndUpdate(req.params.id, {
                    isBlocked: true
                }, { new: true });
            }else if(verify){
                user = await User.findByIdAndUpdate(req.params.id, {
                    isDetailVerified: true
                }, { new: true });
            }

            return res.status(200).json({message: `Berhasil ${block? "Memblock" : "Memverify"} user dengan id ${req.params.id}`, data: user})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    deleteUser: async(req, res, next) =>{
        try {
            if(req.user.role !== "administrator") return res.status(403).json({message: "Menghapus User hanya boleh dilakukan oleh administrasi!"});
            const user = await User.findByIdAndDelete(req.params.id);

            if(!user) return res.status(404).json({message: `Tidak ada user dengan id ${req.params.id}`});

            return res.status(200).json({message: "Berhasil Menghapus User", data: user})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}