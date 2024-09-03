const Invoice = require("../models/model-invoice");
const Pengiriman = require("../models/model-pengiriman");
const { Transaksi } = require("../models/model-transaksi");
const DataProductOrder = require("../models/pesanan/model-data-product-order");

module.exports = {
    getDetailTransaksi: async(req, res, next) => {
        try {
            const { id } = req.params;
        
            const transaksi = await Transaksi.exists({ _id: id });
            if (!transaksi) {
                return res.status(404).json({ message: "Transaksi Tidak Ditemukan" });
            }
        
            const invoice = await Invoice.findOne({ id_transaksi: transaksi._id });
            
            const pengiriman = await Pengiriman.findOne({ invoice: invoice._id }).select("productToDelivers orderId").lean();
            
            const fixedDataProduct = await DataProductOrder.findOne({ pesananId: pengiriman.orderId });
        
            const productIds = pengiriman.productToDelivers.map(prd => prd.productId);
            
            const filteredProd = fixedDataProduct.dataProduct
                .filter(prd => productIds.includes(prd._id.toString()))
                .map(prd => ({
                    name_product: prd.name_product,
                    image_product: prd.image_product[0]
                }));
        
            return res.status(200).json({
                message: "Berhasil mendapatkan data",
                data: {
                    product: filteredProd
                }
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
        
    }
}