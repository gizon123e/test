const axios = require("axios")
const dotenv = require("dotenv")
dotenv.config()
module.exports = {
    searchMeterId: async(req, res, next) => {
        try {
            const { number } = req.query
            const axiosRes = await axios.get(`${process.env.PPOB_HOST}/api/listrik/search`, {
                params: {
                    number: number
                },
                headers: {
                    "Authorization": process.env.SERVER_KEY_PPOB
                }
            });
            return res.status(200).json({ message: "berhasil menampilkan data" , ...axiosRes.data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getBesaranKwh: async(req, res, next) => {
        try {
            const { tarifId, nominal } = req.query
            const axiosRes = await axios.get(`${process.env.PPOB_HOST}/api/listrik/besaran?tarifId=${tarifId}&nominal=${nominal}`);
            return res.status(200).json({ message: "berhasil menampilkan data" , ...axiosRes.data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}