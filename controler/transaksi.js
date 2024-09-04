const Invoice = require("../models/model-invoice");
const Pengiriman = require("../models/model-pengiriman");
const { Transaksi } = require("../models/model-transaksi");
const DataProductOrder = require("../models/pesanan/model-data-product-order");
const Pesanan = require("../models/pesanan/model-orders");

module.exports = {
    getDetailTransaksi: async(req, res, next) => {
        try {
            const { id } = req.params;
        
            const transaksi = await Transaksi.findById(id);
            if (!transaksi) {
                return res.status(404).json({ message: "Transaksi Tidak Ditemukan" });
            }
        
            const invoice = await Invoice.findOne({ id_transaksi: transaksi._id });
            
            const pengiriman = await Pengiriman.findOne({ invoice: invoice._id }).select("productToDelivers orderId total_price").lean();
            
            const fixedDataProduct = await DataProductOrder.findOne({ pesananId: pengiriman.orderId });
        
            const productIds = pengiriman.productToDelivers.map(prd => prd.productId);

            const order = await Pesanan.findById(pengiriman.orderId).select("items");
            const kode_pesanan = order.items
                    .find((item) =>
                      item.product.some((prd) => (prd.productId === pengiriman.productToDelivers[0].productId) && (prd.quantity === pengiriman.productToDelivers[0].quantity))
                    )
                    ?.kode_pesanan;      
            
            const filteredProd = fixedDataProduct.dataProduct
                .filter(prd => productIds.includes(prd._id.toString()))
                .map(prd =>{
                    const pengirimanSelected =  pengiriman.productToDelivers.find(prod => prd._id === prod.productId);
                    return {
                        name_product: prd.name_product,
                        image_product: prd.image_product[0],
                        harga: prd.total_price,
                        quantity: pengirimanSelected.quantity,
                    }
                });
            console.log(transaksi)
            return res.status(200).json({
                message: "Berhasil mendapatkan data",
                data: {
                    product: filteredProd,
                    kode_pesanan,
                    nominalPemasukan: transaksi.detailBiaya.totalHargaProduk,
                    waktu: transaksi.createdAt
                }
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
        
    }
}