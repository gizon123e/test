const HistorySearch = require('../models/history-search')

module.exports = {
    getHistorySearch: async (req, res, next) => {
        try {
            const { search, page = 1, limit = 5 } = req.query
            const skip = (page - 1) * limit;

            let query = {
                userId: req.user.id
            }
            if (search) {
                query.search = { $regex: search, $options: 'i' }
            }

            const datas = await HistorySearch.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })

            res.status(200).json({
                message: "get data success",
                datas
            })
        } catch (error) {
            console.log(error);
            if (error && error.name == "ValidationError") {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields,
                });
            }
            next(error);
        }
    },

    createHistorySearch: async (req, res, next) => {
        try {
            const validate = await HistorySearch.findOne({ search: req.body.search })
            if (validate) return res.status(400).json({ message: "data ini sudah ada " })

            const data = await HistorySearch.create({ search: req.body.search, userId: req.user.id })

            res.status(201).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.log(error);
            if (error && error.name == "ValidationError") {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields,
                });
            }
            next(error);
        }
    },

    deleteSearchHistory: async (req, res, next) => {
        try {
            const { id } = req.query

            const query = {}

            if (id) {
                query._id = id
                query.userId = req.user.id
            }

            let message
            if (id) {
                await HistorySearch.deleteOne(query)
                message = 'by id'
            } else {
                await HistorySearch.deleteMany({ userId: req.user.id })
                message = 'semua history'
            }

            res.status(200).json({ message: `delete data ${message} success` })
        } catch (error) {
            console.log(error);
            if (error && error.name == "ValidationError") {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields,
                });
            }
            next(error);
        }
    }
}