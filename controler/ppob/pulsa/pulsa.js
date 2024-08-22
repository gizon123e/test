const axios = require("axios")
const dotenv = require("dotenv")
dotenv.config()
module.exports = {
    getAllPulsa: async(req, res, next) => {
        try {
            const { number } = req.query
            const axiosRes = await axios.get(`${process.env.PPOB_HOST}/api/pulsa/list?number=${number}`);
            return res.status(200).json({ message: "berhasil menampilkan pulsa" , ...axiosRes.data })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}