const Paylater = require("../models/model-paylater");
const VA = require("../models/model-virtual-account");
const Ewallet = require("../models/model-ewallet");
const Gerai = require("../models/model-gerai")

module.exports = {
    getPayMethod: async(req, res, next) => {
        try {
            const data = await Promise.all([
                Paylater.find(),
                Gerai.find(),
                VA.find(),
                Ewallet.find()
            ]);
            const dataTerolah = []
            data.forEach((item, i)=>{
                if(i === 0){
                    dataTerolah.push({
                        metode: "Paylter",
                        contents: item
                    })
                }else if( i === 1 ){
                    dataTerolah.push({
                        metode: "Gerai",
                        contents: item
                    });
                }else if (i === 2){
                    dataTerolah.push({
                        metode: "Virtual Account",
                        contents: item
                    });
                }else if (i === 3){
                    dataTerolah.push({
                        metode: "E-Wallet",
                        contents: item
                    });
                }
            });

            return res.status(200).json({
                message: "Berhasil Mendapatkan Methode Pembayaran Tersedia",
                data: dataTerolah
            });
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}