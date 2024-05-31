const dotenv = require('dotenv');
const fetch = require('node-fetch');
const DetailPesanan = require('../models/model-detail-pesanan');
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
            const pesanan = await DetailPesanan.findById(order_id);
            if(transaction_status === "settlement"){
                await Pesanan.findByIdAndUpdate(pesanan.id_pesanan, {
                    status: "Berlangsung"
                });
            }else if(transaction_status === "cancel"){
                await Pesanan.findByIdAndUpdate(pesanan.id_pesanan, {
                    status: "Dibatalkan"
                });
            }
            await VA_Used.findOneAndDelete({orderId: order_id})
            return res.status(200)
        } catch (error) {
            
        }
    }
}