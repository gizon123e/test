const Produsen = require('../models/produsen/model-produsen');
const Konsumen = require('../models/konsumen/model-konsumen');
const Vendor = require('../models/vendor/model-vendor');
const Supplier = require('../models/supplier/model-supplier');

module.exports = async (req, res, next) =>{
    try {
        let notFoundData = false;
        switch(req.user.role){
            case "konsumen":
                const konsumen = await Konsumen.findOne({userId: req.user.id});
                if(!konsumen) notFoundData = true;
                break;
            case "vendor":
                const vendor = await Vendor.findOne({userId: req.user.id});
                if(!vendor) notFoundData = true;
                break;
            case "supplier":
                const supplier = await Supplier.findOne({userId: req.user.id});
                if(!supplier) notFoundData = true;
                break;
            case "produsen":
                const produsen = await Produsen.findOne({userId: req.user.id});
                if(!produsen) notFoundData = true;
                break;
        }
        if(notFoundData) return res.status(403).json({message:`User ${req.user.id} belum mengisi data detail`})
        next()
    } catch (error) {
        console.log(error)
        next(error)
    }
}