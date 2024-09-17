const Konsumen = require("../models/konsumen/model-konsumen");
const PicKonsumen = require("../models/konsumen/model-penanggung-jawab");
const Product = require("../models/model-product");
const User = require("../models/model-auth-user");
const bcrypt = require("bcrypt");
const Pesanan = require("../models/pesanan/model-orders");
const MainCat = require("../models/model-main-category");
const SubCat = require("../models/model-sub-category");
const SpecifiCat = require("../models/model-specific-category");
const Carts = require("../models/model-cart");
const SubCategory = require("../models/model-sub-category");
const SpecificCategory = require("../models/model-specific-category");
const MainCategory = require("../models/model-main-category");
const Pengiriman = require("../models/model-pengiriman");
const { default: mongoose } = require("mongoose");
const Chat = require("../models/model-chat");
const PanduanPembayaran = require("../models/model-panduan-pembayaran");
const ProductPerformanceReport = require("../models/model-laporan-kinerja-product");
const Address = require("../models/model-address");
const controler = require('../controler/orders').automaticVendorOrderCancel
const Vendor = require("../models/vendor/model-vendor");
const Sekolah = require("../models/model-sekolah");
const TokoVendor = require("../models/vendor/model-toko");
const Supplier = require("../models/supplier/model-supplier");
const TokoSupplier = require("../models/supplier/model-toko");
const Produsen = require("../models/produsen/model-produsen");
const TokoProdusen = require("../models/produsen/model-toko");
const cekAlamat = require("../utils/cek-alamat")
const controllerOrder = require("../controler/orders");
const fs = require("fs")
// require("../database/database");
// const geoIp = require('geoip2-api');



async function blah() {
    
//     try {
        
//         // const chat = await Chat.find({});
//         // chat.forEach( (chat) => {
//         //     chat.messages.forEach( (message) => {
//         //         const contents = message.content
//         //         console.log(contents)
//         //     })
//         // })
//         // controllerOrder.automaticVendorOrderCancel()
//         // const data = {
//         //     "idPengiriman":"PNR_KNS_20240903_171604_101",
//         //     "total_ongkir":726000,
//         //     "status":"Sedang Dikirim",
//         //     "image":"https://staging-backend.superdigitalapps.my.i/public/img_products/Nasi_Wuduk_1721811652543.jpg"
//         // }
//         // const data = { idPengiriman: "PNR_KNS_20240903_171604_101", total_ongkir: 726000, status: "Sedang Dikirim", image: "https://staging-backend.superdigitalapps.my.id/public/img_products/Nasi_Wuduk_1721811652543.jpg" }
//         // console.log(JSON.parse({"msg":"udah dikirim?"}))
//         // const pin_baru = await bcrypt.hash("111111", 10);
//         // await User.findOneAndUpdate({
//         //     'email.content': "isalkons@yopmail.com"
//         // }, { pin: pin_baru })
//         // const email = [
//         //     "aryavendor@yopmail.com",
//         //     "rima@yopmail.com",
//         //     "aryadistri@yopmail.com",
//         //     "distri-company-pt@yopmail.com",
//         //     "joivaumoipromeu-3798@yopmail.com",
//         //     "aryaprodusen@yopmail.com",
//         //     "aryasupplier@yopmail.com",
//         //     "vend@yopmail.com",
//         //     "kons@yopmail.com",
//         //     "aryabatara17@gmail.com"
//         // ]
    
//         // const users = await User.find({'email.content': { $in: email}})
//         // for(const user of users){
//         //     console.log(`setting addres untuk user ${user.email.content}`)
//         //     await Address.updateOne(
//         //         { userId: user._id, isUsed: true },
//         //         { isUsed: false }
//         //     )
//         //     const dataAddress = await Address.create({
//         //         province: "Jawa Barat",
//         //         regency: "Sukabumi",
//         //         district: "Baros",
//         //         village: "Kelurahan",
//         //         code_pos: "43166",
//         //         address_description: "Jalan Tata Nugraha",
//         //         pinAlamat:{
//         //             long: 106.92861631043726,
//         //             lat: -6.953337594406691
//         //         },
//         //         userId: user._id,
//         //         isMain: true,
//         //         isUsed: true
//         //     })
//         //     if(user.role === "konsumen"){
//         //         await Konsumen.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //         await Sekolah.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //     }else if(user.role === "vendor"){
//         //         await Vendor.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //         await TokoVendor.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //     }else if(user.role === "supplier"){
//         //         await Supplier.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //         await TokoSupplier.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //     }else if(user.role === "produsen"){
//         //         await Produsen.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //         await TokoProdusen.findOneAndUpdate(
//         //             { userId: user._id },
//         //             { address: dataAddress._id }
//         //         )
//         //     }
//         //     console.log(`berhasil setting addres untuk user ${user.email.content}`)
//         // }
//         // const valid = cekAlamat(106.7362117767334, -6.344186743483121)
//         // console.log(valid)
//     } catch (error) {
//         console.log(error)
//     }
}


blah()
