const axios = require("axios")
const dotenv = require("dotenv")
dotenv.config()
module.exports = {
    searchMeterId: async(req, res, next) => {
        try {
            const { number } = req.query
            const axiosRes = await axios.get(`${process.env.PPOB_HOST}/api/listrik/search?nomor=${number}`);
            return res.status(200).json({ message: "berhasil menampilkan data" , ...axiosRes.data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}