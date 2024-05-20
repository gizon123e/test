const Fintech = require("../models/model-fintech");
const VA = require("../models/model-virtual-account");
const Ewallet = require("../models/model-ewallet");
const Gerai = require("../models/model-gerai");
const Saldo = require("../models/model-saldoApp")

module.exports = {
    getPayMethod: async(req, res, next) => {
        try {
            const data = await Promise.all([
                Fintech.find(),
                Gerai.find(),
                VA.find(),
                Ewallet.find(),
                Saldo.find()
            ]);
            const dataTerolah = []
            data.forEach((item, i)=>{
                if(i === 0){
                    dataTerolah.push({
                        metode: "Fintech",
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
                }else if (i === 4){
                    dataTerolah.push({
                        metode: "SaldoApp",
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