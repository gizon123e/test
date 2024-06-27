const dotenv = require('dotenv');
const fetch = require('node-fetch');
const DetailPesanan = require('../models/model-detail-pesanan');
const Pengiriman = require("../models/model-pengiriman")
const Pesanan = require('../models/model-orders');
const User = require('../models/model-auth-user')
const VA_Used = require('../models/model-va-used');
const Transaksi = require('../models/model-transaksi');
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
            let pesanan;
            let user;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();

            const hh = String(today.getHours()).padStart(2, '0');
            const mn = String(today.getMinutes()).padStart(2, '0');
            const ss = String(today.getSeconds()).padStart(2, '0');
            const date = `${yyyy}${mm}${dd}`;
            const minutes = `${hh}${mn}${ss}`
            if(transaction_status === "settlement"){
                pesanan = await Pesanan.findByIdAndUpdate(detailPesanan.id_pesanan, {
                    status: "Berlangsung"
                }, { new: true });
                if(pesanan.poinTerpakai){
                    user = await User.findByIdAndUpdate(pesanan.userId, {
                        $inc: { poin: -pesanan.poinTerpakai }
                    });
                }
                await DetailPesanan.findByIdAndUpdate(order_id, {
                    isTerbayarkan: true
                });
                
                await VA_Used.findOneAndDelete({orderId: order_id});
                
                const total_pengiriman = await Pengiriman.estimatedDocumentCount({
                    createdAt: {
                        $gte: now,
                        $lt: tomorrow
                    }
                });

                await Transaksi.findOneAndUpdate({id_pesanan: pesanan._id}, { status: "Pembayaran Berhasil"})

                for ( const ship of pesanan.shipments ){
                    //buat kode pengiriman
                    await Pengiriman.create({
                        orderId: pesanan._id,
                        distributorId: ship.id_distributor,
                        productToDelivers: ship.products,
                        kode_pengiriman: `PNR_${user.get('kode_role')}_${date}_${minutes}_${total_pengiriman + 1}`,
                        ...ship
                    });
                }
                
            }else if(transaction_status === "cancel"){
                await Pesanan.findByIdAndUpdate(detailPesanan.id_pesanan, {
                    status: "Dibatalkan"
                });
            }
            
            return res.status(200).json({message:"Mantap"})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}