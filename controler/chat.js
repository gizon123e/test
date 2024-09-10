const Chat = require("../models/model-chat");
const Distributtor = require("../models/distributor/model-distributor");
const Konsumen = require("../models/konsumen/model-konsumen");
const Produsen = require("../models/produsen/model-produsen");
const Supplier = require("../models/supplier/model-supplier");
const Vendor = require("../models/vendor/model-vendor");
const { io } = require("socket.io-client");
const dotenv = require('dotenv')
dotenv.config()
const socket = io(process.env.WEBSOCKET, {
    auth: {
        fromServer: true,
    },
});

module.exports = {
    getAllChat: async (req, res, next) => {
        try {
            const chats = await Chat.find({
                participants: { $in: [req.user.id] }
            }).populate({ path: 'participants', select: "role" })
              .sort({  updatedAt: -1, 'messages.timestamp': 1 })
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
            console.log(req.user)
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

            socket.emit('status_user', lawanBicara.userId)
            let status_user

            socket.on('status_user', (data) => {
                console.log('hasil nya: ',data)
                status_user = data
            })

            console.log(status_user)

            const mappedSender = await Promise.all(messages.map(async (msg) => {
                const { sender, ...restOfMsg } = msg
                let senderDetail;
                let detail;

            
                switch (msg.sender.role) {
                    case "konsumen":
                        detail = await Konsumen.findOne({ userId: msg.sender._id }).select("profile_pict namaBadanUsaha userId nama").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail konsumen tidak ditemukan" });
                        }
                        senderDetail = { userId: detail.userId , role: msg.sender.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
                        break;
                    case "vendor":
                        detail = await Vendor.findOne({ userId: msg.sender._id }).select("profile_pict namaBadanUsaha userId nama").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail vendor tidak ditemukan" });
                        }
                        senderDetail = { userId: detail.userId , role: msg.sender.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
                        break;
                    case "supplier":
                        detail = await Supplier.findOne({ userId: msg.sender._id }).select("profile_pict namaBadanUsaha userId nama").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail supplier tidak ditemukan" });
                        }
                        senderDetail = { userId: detail.userId , role: msg.sender.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
                        break;
                    case "produsen":
                        detail = await Produsen.findOne({ userId: msg.sender._id }).select("profile_pict namaBadanUsaha userId nama").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail produsen tidak ditemukan" });
                        }
                        senderDetail = { userId: detail.userId , role: msg.sender.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
                        break;
                    case "distributor":
                        detail = await Distributtor.findOne({ userId: msg.sender._id }).select("imageProfile nama_distributor userId").lean();
                        if (!detail) {
                            return res.status(404).json({ message: "Detail distributor tidak ditemukan", });
                        }
                        senderDetail = { userId: detail.userId , role: msg.sender.role , profile_pict: detail.imageProfile, nama: detail.nama_distributor };
                        break;
                    default:
                        return res.status(400).json({ message: "Role tidak dikenali" });
                }
            
                return { sender: senderDetail, ...restOfMsg };
            }));
            
        
            return res.status(200).json({ message: "Berhasil Mendapatkan Chat", data: { ...restOfChat, messages: mappedSender, lawanBicara: { ...lawanBicara, status_user } } });
        } catch (error) {
            console.log(error);
            next(error);
        }
        
    },
}