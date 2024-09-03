const Distributtor = require("../models/distributor/model-distributor");
const Konsumen = require("../models/konsumen/model-konsumen");
const Chat = require("../models/model-chat");
const Produsen = require("../models/produsen/model-produsen");
const Supplier = require("../models/supplier/model-supplier");
const Vendor = require("../models/vendor/model-vendor");

module.exports = {
    getAllChat: async (req, res, next) => {
        try {
            const chats = await Chat.find({
                participants: { $in: [req.user.id] }
            }).populate({ path: 'participants', select: "role" })
              .sort({ 'messages.timestamp': 1 })
              .lean();
    
            if (chats.length === 0) {
                return res.status(200).json({ message: "Anda tidak memiliki percakapan" });
            }
    
            const detailedChats = await Promise.all(chats.map(async (chat) => {
                const { participants, __v, ...restOfChat } = chat;
    
                const index = participants.findIndex(user => user._id.toString() !== req.user.id.toString());
                const lawanBicara = participants[index];
    
                let detailLawanBicara;
                switch (lawanBicara.role) {
                    case "konsumen":
                        detailLawanBicara = await Konsumen.findOne({ userId: lawanBicara._id });
                        break;
                    case "vendor":
                        detailLawanBicara = await Vendor.findOne({ userId: lawanBicara._id });
                        break;
                    case "supplier":
                        detailLawanBicara = await Supplier.findOne({ userId: lawanBicara._id });
                        break;
                    case "produsen":
                        detailLawanBicara = await Produsen.findOne({ userId: lawanBicara._id });
                        break;
                    case "distributor":
                        detailLawanBicara = await Distributtor.findOne({ userId: lawanBicara._id });
                        break;
                    default:
                        detailLawanBicara = null;
                }

                return {
                    lawanBicara: {
                        nama: detailLawanBicara.nama || detailLawanBicara.namaBadanUsaha || detailLawanBicara.nama_distributor,
                        profile_pict: detailLawanBicara.profile_pict || detailLawanBicara.imageProfile
                    },
                    ...restOfChat,
                };
            }));
    
            // Return the detailed chat data
            return res.status(200).json({ message: "Berhasil Menampilkan Semua Chat", data: detailedChats });
    
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    

    getDetailChat: async(req, res, next) => {
        try {
            const chat = await Chat.findById(req.params.id)
                .populate({ path: "participants", select: "role" })
                .populate({ path: "messages.sender", select: "role" })
                .sort({ 'messages.timestamp': 1 })
                .lean();
        
            if (!chat) {
                return res.status(404).json({ message: "Percakapan tidak ditemukan" });
            }
        
            const { participants, __v , messages , ...restOfChat } = chat;
        
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
            };

            const mappedSender = await Promise.all(messages.map(async (msg) => {
                const { sender, ...restOfMsg } = msg
                let senderDetail;
                let detail;
            
                switch (msg.sender.role) {
                    case "konsumen":
                        detail = await Konsumen.findOne({ userId: msg.sender.role._id }).select("profile_pict namaBadanUsaha userId").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail konsumen tidak ditemukan" });
                        }
                        senderDetail = { ...detail };
                        break;
                    case "vendor":
                        detail = await Vendor.findOne({ userId: msg.sender.role._id }).select("profile_pict namaBadanUsaha userId").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail vendor tidak ditemukan" });
                        }
                        senderDetail = { ...detail };
                        break;
                    case "supplier":
                        detail = await Supplier.findOne({ userId: msg.sender.role._id }).select("profile_pict namaBadanUsaha userId").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail supplier tidak ditemukan" });
                        }
                        senderDetail = { ...detail };
                        break;
                    case "produsen":
                        detail = await Produsen.findOne({ userId: msg.sender.role._id }).select("profile_pict namaBadanUsaha userId").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail produsen tidak ditemukan" });
                        }
                        senderDetail = { ...detail };
                        break;
                    case "distributor":
                        detail = await Distributtor.findOne({ userId: msg.sender.role._id }).select("imageProfile namaBadanUsaha userId").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail distributor tidak ditemukan" });
                        }
                        senderDetail = { ...detail, profile_pict: detail.imageProfile };
                        delete senderDetail.imageProfile;
                        break;
                    default:
                        return res.status(400).json({ message: "Role tidak dikenali" });
                }
            
                return { sender, ...restOfMsg };
            }));
            
        
            return res.status(200).json({ message: "Berhasil Mendapatkan Chat", data: { ...restOfChat, messages: mappedSender, lawanBicara } });
        } catch (error) {
            console.log(error);
            next(error);
        }
        
    },
}