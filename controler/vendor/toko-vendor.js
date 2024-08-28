const Toko = require('../../models/vendor/model-toko');
const Address = require('../../models/model-address');
const BiayaTetap = require("../../models/model-biaya-tetap");
const path = require('path');
const Product = require('../../models/model-product');
const {Pangan} = require('../../models/model-pangan');
const SalesReport = require('../../models/model-laporan-penjualan');
const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman');
const TokoVendor = require('../../models/vendor/model-toko');
const IncompleteOrders = require('../../models/pesanan/model-incomplete-orders');
const Vendor = require('../../models/vendor/model-vendor');
const Follower = require('../../models/model-follower');
const User = require('../../models/model-auth-user');
const dotenv = require('dotenv')
const mergeObjectsByStoreId = require('../../utils/merginPengirimanId')
const { io } = require("socket.io-client");
const SellerPerformanceReport = require('../../models/model-laporan-kinerja-toko');
const Wishlist = require('../../models/model-wishlist');
const ProductPerformanceReport = require('../../models/model-laporan-kinerja-product');
dotenv.config()
const socket = io("https://staging-backend.superdigitalapps.my.id/", {
    auth: {
      fromServer: true,
    },
});

module.exports = {
    createToko: async(req, res, next) => {
        try {
            const alamat = await Address.create({
                province: req.body.province,
                regency: req.body.regency,
                district: req.body.district,
                village: req.body.village,
                address_description: req.body.address_description,
                label: req.body.label,
                code_pos: req.body.code_pos,
                pinAlamat:{
                    long: req.body.long_pin_alamat,
                    lat: req.body.lat_pin_alamat
                },
                userId: req.body.id,
                isStore: true,
            })
            const newDataToko = await Toko.create({
                userId: req.body.id,
                detailId: req.body.detailId,
                namaToko: req.body.namaToko,
                address: alamat._id,
                userId: req.body.id,
            });

            return res.status(201).json({message: "Berhasil mengubah data Toko", data: newDataToko})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getDetailToko: async(req, res, next) => {
        try {
            const { bintang } = req.query
            if(req.user.role !== "konsumen") return res.status(403).json({message: "Invalid Request"})
            const dataToko = await Toko.findOne({userId: req.params.id}).populate('address').lean();
            const bergabung = await User.findById(req.params.id).select("createdAt");
            const query = { 
                userId: req.params.id, 
                'status.value': "terpublish",
            }
            if(bintang) query.poin_ulasan = bintang
            const products = await Product.find(query)
            .select("_id image_product total_stok name_product total_price poin_review price")
            .sort({ poin_review: -1, total_stok: -1 })
            .lean();

            const pengikut = await Follower.countDocuments({
                sellerUserId: req.params.id
            });
            socket.emit('status_user', req.params.id)
            let status_user 
            
            socket.on('status_user', (data) => {
                console.log(data)
                status_user = data
            })

            const followed = await Follower.exists({userId: req.user.id, sellerUserId: req.params.id})
            
            for (const product of products) {
                const record = await SalesReport.findOne({ productId: product._id });
                const terjual = record ? record.track.reduce((acc, val) => acc + val.soldAtMoment, 0) : 0;
                product.terjual = terjual;
            };
            if(!dataToko) return res.status(404).json({message: `Toko dengan userId: ${req.params.id} tidak ditemukan`});
            return res.status(200).json({
                message: "Berhasil Mendapatkan Data Toko", 
                data: { 
                    ...dataToko, 
                    tanggal_bergabung: bergabung.createdAt,
                    pengikut,
                }, 
                dataProduct: products,
                total_produk_terjual: products.reduce((acc,prd) => acc + prd.terjual, 0),
                followed: followed? true : false,
                status_user
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updateDetailToko: async(req, res, next) => {
        try {
            if(req.files && req.files.profilePict){
                const nameImg = `${new Date().getTime()}_${req.user.id}${path.extname(req.files.profilePict.name)}`
                const imgPath = path.join(__dirname, "../../public", "profile-picts-store", nameImg)
                req.files.profilePict.mv(imgPath, err =>{
                    if(err) return res.status(500).json({message: "Ada kesalaahn saat nyimpan foto", err})
                })
                req.body.profile_pict = `${process.env.HOST}public/profile-picts-store/${nameImg}`
            }
            const updatedToko = await Toko.findOneAndUpdate({userId: req.user.id}, req.body, { new: true });
            if(!updatedToko) return res.status(404).json({message: "Kamu tidak mempunyai Toko"});
            return res.status(201).json({message: "Berhasil Memperbarui Data Toko", data: updatedToko})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    myStore: async(req, res, next) => {
        try {
            const store = await Toko.findOne({userId: req.user.id}).populate('address').lean();
            const pengikut = await Follower.countDocuments({
                sellerUserId: req.user.id
            })
            return res.status(200).json({data: {...store, pengikut}})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllProsesPengiriman: async (req, res, next) => {
        try {   
            const { status } = req.query
            const toko = await TokoVendor.findOne({userId: req.user.id})
            const dataProsesPengirimanDistributor = await ProsesPengirimanDistributor.find({ tokoId: toko._id, status_distributor: { $ne: "Belum dijemput"} })
                .populate({
                    path: "tokoId",
                    populate: "address"
                })
                .populate({
                    path: "buyerId",
                    populate: "address"
                })
                .populate("jenisPengiriman")
                .populate("jenisKendaraan")
                .populate({
                    path: "produk_pengiriman.productId",
                    populate: "categoryId"
                })
                .populate("pengirimanId")
                .populate('distributorId')
                .lean()

            if (!dataProsesPengirimanDistributor || dataProsesPengirimanDistributor.length === 0) return res.status(400).json({ message: "data saat ini masi kosong" })
            const data = dataProsesPengirimanDistributor.map(pgr => {
                const { waktu_pengiriman, status_distributor, pengirimanId , ...restOfPgr } = pgr;
                
                const generateStatus = () => {
                    
                    if(status_distributor === "Sedang dijemput"){
                        return "menunggu penjemputan"
                    }

                    if(status_distributor === 'Sudah dijemput'){
                        return 'diserahkan ke distributor'
                    }

                    if(status_distributor === 'Selesai'){
                        return 'telah diterima konsumen'
                    }

                    if(status_distributor === 'Sedang dikirim'){
                        return 'sedang dalam perjalanan'
                    }
                }
                
                return {
                    ...restOfPgr,
                    pengirimanId: mergeObjectsByStoreId(pengirimanId),
                    status_distributor: generateStatus(),
                    waktu_pengiriman: new Date(waktu_pengiriman)
                }
            })
            res.status(200).json({
                message: "data get All success",
                datas: data.filter(pgr => {
                    if(!status) return true;

                    return pgr.status_distributor === status
                })
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updatePerformanceSeller: async(req, res, next) => {
        try {
            if (!req.body.tokoId) return res.status(400).json({ message: "Dibutuh kan payload tokoId" });
      
            const kinerja = await SellerPerformanceReport.findOne({ tokoId: req.body.tokoId, userId: req.user.id });
            
            if(!kinerja){
                SellerPerformanceReport.create({ tokoId: req.body.tokoId, userId: req.user.id, tokoType: "TokoVendor" })
                .then(()=>console.log("berhasil simpan performance produk"))
                .catch((e)=>console.log("gagal simpan performance produk ", e))
            };

            return res.status(200).json({ message: "Berhasil update performance product!", data: kinerja });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getRingkasan: async(req, res, next) => {    
        try {
            const toko = await TokoVendor.exists({userId: req.user.id});
            const kunjungan_toko = await SellerPerformanceReport.countDocuments({tokoId: toko._id});
            const products = (await Product.find({userId: req.user.id}).lean()).map(prd => prd._id);
            let total_produk = 0;
            let total_quantity = 0;
            const addedProduct = new Set()
            const total_penjualan = await SalesReport.find({productId: { $in: products }}).lean()
            for(sp of total_penjualan){
                total_quantity += sp.track.reduce((acc, val) => {
                    if(!addedProduct.has(sp.productId)){
                        total_produk += 1;
                        addedProduct.add(sp.productId)
                    }
                    return acc + val.soldAtMoment
                }, 0)
            };
            const tayangan_product = await ProductPerformanceReport.countDocuments({productId: { $in: products}})
            const total_wishlist = await Wishlist.countDocuments({productId: { $in: products }});

            return res.status(200).json({ message: "Berhasil menampilkan ringkasan", kunjungan_toko, total_penjualan: { total_produk, total_quantity }, daftar_keinginan: total_wishlist, tayangan_product })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    grafikPerforma: async(req, res, next) => {
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const {
                dateStart = today.setHours(0, 0, 0, 0), 
                dateEnd = tomorrow.setHours(0, 0, 0, 0) 
            } = req.query;

            const startDate = new Date(dateStart);
            const endDate = new Date(dateEnd);
            endDate.setMonth(endDate.getMonth(), 0); // Set to the last day of the current month
            const products = (await Product.find({ userId: req.user.id }).lean()).map(prd => prd._id);

            const kunjungan_produk = await ProductPerformanceReport.aggregate([
                {
                    $match: {
                        productId: { $in: products },
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            const results = [];
            let currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                const formattedDate = currentDate.toISOString().split('T')[0];

                const found = kunjungan_produk.find(k => k._id === formattedDate);
                results.push({
                    _id: formattedDate,
                    count: found ? found.count : Math.floor(Math.random() * 10)
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return res.status(200).json({ message: "Berhasil menampilkan grafik performa", data: results });

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getProdukPopuler: async(req, res, next) => {
        try {
            const products = await Product.find({userId: req.user.id}).select("_id image_product name_product total_stok").lean();
            const datas = await Promise.all(products.map(async(prod)=> {
                const report = await SalesReport.findOne({productId: prod._id}).lean();
                const klik = await ProductPerformanceReport.countDocuments({productId: prod._id})
                const total_terjual = report ? report.track.reduce((acc, val) => acc + val.soldAtMoment, 0) : 0;
                return {
                    ...prod,
                    total_terjual,
                    klik
                }
            }))

            datas.sort((a, b) => {
                if (b.total_terjual === a.total_terjual) {
                    return b.klik - a.klik;
                }
                return b.total_terjual - a.total_terjual;
            });

            return res.status(200).json({message: "berhasil mendapatkan produk populer",datas})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getNotifUpload: async(req, res, next) => {
        try{
            const dataToko = await Toko.findOne({userId: req.user.id}).populate('address');
            const province = dataToko.address.province;
            const provinceRegex = new RegExp(`^${province}`, 'i');

            const message = await BiayaTetap.findOne({ _id: "66456e44e21bfd96d4389c73" }).select("notif_rekomen_vendor");

            const timestamp = new Date();
            const day = String(timestamp.getDate()).padStart(2, '0');
            const month = String(timestamp.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
            const year = timestamp.getFullYear();

            const today = `${day}-${month}-${year}`

            const rekomendasiMakanan = await Pangan.find({
                 mayoritas_daerah_lokal: { $regex: provinceRegex },
                 jenis_makanan: "makanan utama"
                }).select("_id jenis_makanan kode_bahan image_pangan nama_bahan kelompok_pangan jenis_pangan nama_makanan_lokal mayoritas_daerah_lokal keterangan");
                
            res.status(200).json({
                jenis: 'info',
                title: `Rekomendasi kebutuhan makanan di provinsi ${province}`,
                message: message.notif_rekomen_vendor,
                rekomendasiMakanan,
                waktu: today,
            });
        }catch (error) {
            console.log(error);
            next(error);
        }
    }
}