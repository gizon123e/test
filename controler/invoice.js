const User = require("../models/model-auth-user");
const Invoice = require("../models/model-invoice");
const Pengiriman = require("../models/model-pengiriman");
const { Transaksi } = require("../models/model-transaksi");
const DataProductOrder = require("../models/pesanan/model-data-product-order");
const Pesanan = require("../models/pesanan/model-orders");
const TokoVendor = require("../models/vendor/model-toko");

module.exports = {
    detailInvoice: async (req, res, next) => {
        try {
            console.log('sip')
            console.log(req.params.id)
            const order = await Pesanan.findById(req.params.id).populate("addressId")
            const dataProd = await DataProductOrder.findOne({pesananId: req.params.id})
            const transaksiSubsidi = await Transaksi.findOne({id_pesanan: req.params.id, subsidi: true});
            const transaksiTambahan = await Transaksi.findOne({id_pesanan: req.params.id, subsidi: false});

            const invoiceTambahan = await Invoice.findOne({id_transaksi: transaksiTambahan._id});
            const invoiceSubsidi = await Invoice.findOne({id_transaksi: transaksiSubsidi._id});

            // const pengirimanSubsidi = await Pengiriman.find({invoice: invoiceSubsidi._id})
            // const pengirimanTambahan = await Pengiriman.find({invoice: invoiceTambahan._id})
            const tambahan = []
            const subsidi = []
            const store = {}
            for(const prod of dataProd.dataProduct){
                const storeId = prod.userId._id
                let detailToko
                const user = await User.findById(storeId).select("email phone").lean()
                switch(prod.userId.role){
                    case "vendor":
                        detailToko = await TokoVendor.findOne({ userId: prod.userId._id }).select('namaToko address').populate('address').lean();
                        break;
                    case "supplier":
                        detailToko = await Supplier.findOne({ userId: prod.userId._id }).lean();
                        break;
                    case "produsen":
                        detailToko = await Produsen.findOne({ userId: prod.userId._id }).lean();
                    break;
                }

                if(invoiceTambahan && (invoiceTambahan.staus === "Belum Lunas" || invoiceTambahan.staus === "Lunas")){
                    if(!store[storeId]){
                        store[storeId] = {
                            toko: { 
                                userIdSeller: user._id,
                                email: user.email.content, 
                                phone: user.phone.content,  
                                ...detailToko, 
                                // status_pengiriman: [selectedPengiriman]
                            },
                            products: []
                        }
                    }
    
                    store[storeId].products.push(prod)

                }
                
            }

            return res.status(200).json(Object.keys(store).map(key => { return store[key]}))
            
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}