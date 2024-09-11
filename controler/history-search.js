const HistorySearch = require('../models/history-search')

module.exports = {
    createHistorySearch: async (req, res, next) => {
        try {
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
    }
}