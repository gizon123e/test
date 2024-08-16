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
                isStore: true
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
            const dataToko = await Toko.findOne({userId: req.params.id}).populate('address').lean();
            const bergabung = await User.findById(req.params.id).select("createdAt");
            const query = { 
                userId: req.params.id, 
                'status.value': "terpublish",
            }
            if(bintang) query.poin_ulasan = bintang
            const products = await Product.find(query)
            .select("_id image_product total_stok name_product total_price poin_review")
            .sort({ total_stok: -1 })
            .lean();

            const pengikut = await Follower.countDocuments({
                sellerUserId: req.params.id
            });

            const followed = await Follower.findOne({userId: req.user.id, sellerUserId: req.params.id})
            
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
                followed: followed? true : false
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
                    path: "sekolahId",
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
                const { waktu_pengiriman, status_distributor, ...restOfPgr } = pgr
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