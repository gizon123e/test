const { default: mongoose } = require("mongoose");
const SalesReport = require("../models/model-laporan-penjualan");

async function salesReport(productId, dataSales){
    const found = await SalesReport.findOne({productId});
    if(!found){
        return SalesReport.create({
            _id: new mongoose.Types.ObjectId(),
            productId,
            track: [
                dataSales
            ]
        })
    }

    return SalesReport.findOneAndUpdate(
        { productId: productId },
        {
            $push: {
                track: dataSales
            }
        }
    )
}

module.exports = salesReport