const OrderDistributtor = require('../../models/distributtor/model-order-distributtor')
const { getAllDistributtor } = require('./distributtor')

module.exports = {
    getAllOrderDistributtor: async (req, res, next) => {
        try {
            const dataDistributtor = await OrderDistributtor.find()

            return res.status(200).json({ message: 'get all orders distributtor success', datas: dataDistributtor })
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    }
}