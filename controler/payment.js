const dotenv = require('dotenv');
const fetch = require('node-fetch');
const DetailPesanan = require('../models/model-detail-pesanan');
const Pengiriman = require("../models/model-pengiriman")
const Pesanan = require('../models/model-orders');
const VA_Used = require('../models/model-va-used')
dotenv.config();

module.exports = {
    statusPayment: async (req, res, next) =>{
        try {
            const options = {
                method: 'GET',
                headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  'Authorization': `Basic ${btoa(process.env.SERVERKEY + ':')}`
                },
            };
            const respon = await fetch(`${process.env.MIDTRANS_URL}/${req.params.id}/status`, options);
            const finalResult = await respon.json()
            console.log(finalResult)
            return res.status(200).json({message: `Status Transaksi Ini ${finalResult.transaction_status}`})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    midtransWebHook: async(req, res, next) => {
        try {
            const { order_id, transaction_status } = req.body;
            const detailPesanan = await DetailPesanan.findById(order_id);
            if(transaction_status === "settlement"){
                const pesanan = await Pesanan.findByIdAndUpdate(detailPesanan.id_pesanan, {
                    status: "Berlangsung"
                }, { new: true });
                
                await DetailPesanan.findByIdAndUpdate(order_id, {
                    isTerbayarkan: true
                });
                
                await VA_Used.findOneAndDelete({orderId: order_id});
                
                for ( const ship of pesanan.shipments ){
                    console.log(ship);
                    await Pengiriman.create({
                        orderId: pesanan._id,
                        distributorId: ship.id_distributor,
                        productToDelivers: ship.products,
                        ...ship
                    });
                }
                
            }else if(transaction_status === "cancel"){
                await Pesanan.findByIdAndUpdate(pesanan.id_pesanan, {
                    status: "Dibatalkan"
                });
            }
            return res.status(200).json({message:"Mantap"})
        } catch (error) {
            
        }
    }
}