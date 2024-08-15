const Distributtor = require("../models/distributor/model-distributor");
const Konsumen = require("../models/konsumen/model-konsumen");
const Chat = require("../models/model-chat");
const Produsen = require("../models/produsen/model-produsen");
const Supplier = require("../models/supplier/model-supplier");
const Vendor = require("../models/vendor/model-vendor");

module.exports = {
    getAllChat: async(req, res, next) => {
        try {
            const chats = await Chat.find({
                participants: { $in: [req.user.id] }
            }).sort({ 'messages.timestamp': 1 }).lean();

            if(chats.length === 0) return res.status(200).json({message: "Anda tidak memiliki percakapan"})
            return res.status(200).json({message: "Berhasil Menampilkan Semua Chat", data: chats})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getDetailChat: async(req, res, next) => {
        try {
            const chat = await Chat.findById(req.params.id)
                .populate({ path: "participants", select: "role" })
                .sort({ 'messages.timestamp': 1 })
                .lean();
        
            if (!chat) {
                return res.status(404).json({ message: "Percakapan tidak ditemukan" });
            }
        
            const { participants, ...restOfChat } = chat;
        
            let lawanBicara = participants.find(pr => pr._id.toString() !== req.user.id.toString());
            if (!lawanBicara) {
                return res.status(404).json({ message: "Lawan bicara tidak ditemukan" });
            }
        
            switch (lawanBicara.role) {
                case "konsumen":
                    const konsumenDetail = await Konsumen.findOne({ userId: lawanBicara._id }).select("profile_pict namaBadanUsaha userId").lean();
                    if (!konsumenDetail) {
                        return res.status(404).json({ message: "Detail konsumen tidak ditemukan" });
                    }
                    lawanBicara = { ...lawanBicara, ...konsumenDetail };
                    break;
                case "vendor":
                    const vendorDetail = await Vendor.findOne({ userId: lawanBicara._id }).select("profile_pict namaBadanUsaha userId").lean();
                    if (!vendorDetail) {
                        return res.status(404).json({ message: "Detail konsumen tidak ditemukan" });
                    }
                    lawanBicara = { ...lawanBicara, ...vendorDetail };
                    break;
                case "supplier":
                    const supplierDetail = await Supplier.findOne({ userId: lawanBicara._id }).select("profile_pict namaBadanUsaha userId").lean();
                    if (!supplierDetail) {
                        return res.status(404).json({ message: "Detail konsumen tidak ditemukan" });
                    }
                    lawanBicara = { ...lawanBicara, ...supplierDetail };
                    break;
                case "produsen":
                    const produsenDetail = await Produsen.findOne({ userId: lawanBicara._id }).select("profile_pict namaBadanUsaha userId").lean();
                    if (!produsenDetail) {
                        return res.status(404).json({ message: "Detail konsumen tidak ditemukan" });
                    }
                    lawanBicara = { ...lawanBicara, ...produsenDetail };
                    break;
                case "distributor":
                    const distributorDetail = await Distributtor.findOne({ userId: lawanBicara._id }).select("imageProfile namaBadanUsaha userId").lean();
                    const { imageProfile, ...restDistri } = distributorDetail
                    if (!distributorDetail) {
                        return res.status(404).json({ message: "Detail distributor tidak ditemukan" });
                    }
                    lawanBicara = { ...lawanBicara, ...restDistri, profile_pict: imageProfile };
                    break;
                default:
                    return res.status(400).json({ message: "Role tidak dikenali" });
            }
        
            return res.status(200).json({ message: "Berhasil Mendapatkan Chat", data: { ...restOfChat, lawanBicara } });
        } catch (error) {
            console.log(error);
            next(error);
        }
        
    },
}