const Invoice = require('../../models/model-invoice')

module.exports = {
    getAllInvoice: async (req, res, next) => {
        try {
            const datas = await Invoice.find().populate({
                path: 'id_transaksi',
                populate: 'id_pesanan'
            })

            res.status(200).json({
                message: 'get All data success',
                datas
            })
        } catch (error) {
            console.error(error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.errors
                });
            }
            next(error);
        }
    }
}