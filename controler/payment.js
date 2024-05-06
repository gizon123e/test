const dotenv = require('dotenv')
const midtransClient = require('midtrans-client');
const Order = require('../models/models-orders');
dotenv.config();

const snap = new midtransClient.Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction : false,
    serverKey : process.env.SERVERKEY
});

module.exports = {
    getPayment: async (req, res, next) =>{
        try {
            const id = req.query.order_id;

            if(!id) return res.status(400).json({message:"tolong masukan order_id didalam query"});

            const order = await Order.findById(id).populate('userId');

            if(!order) return res.status(400).json({message:`Order dengan id ${id} tidak ditemukan`});
            const midtransPayload = {
                transaction_details:{
                    order_id: id,
                    gross_amount: order.total_price
                },
                credit_card: {
                    secure: true
                },
                customer_details:{
                    first_name: order.userId.username,
                    email: order.userId.email,
                    phone: order.userId.phone
                }
            };

            const transaksi = await snap.createTransaction(JSON.stringify(midtransPayload));
            if(transaksi) return res.status(200).json({message: "Berhasil mendapatkan detail pembayaran", data: transaksi});

        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    statusPayment: async (req, res, next) =>{
        const { status, order_id } = req.query;
        if(!status) return res.status(400).json({message:"Status Pembayaran tidak ditemukan. Status nya apa yak? [error, success]"});
        if(!order_id) return res.status(400).json({message:"Kirimkan juga dong order_id nya"});
        if(status !== "error" && status !== "success") return res.status(400).json({message: "statusnya cukup kasih error atau success aja ya. Gak perlu yang lain"});
        if(status === "success"){
            const order = await Order.findByIdAndUpdate( order_id, {status: "Sedang diproses"}, {new: true});
            return res.status(200).json({message:"Berhasil memperbarui status order", data: order});
        }else{
            return res.status(226).json({message:"Gagal memperbarui status order", data: null});
        }
    }
}