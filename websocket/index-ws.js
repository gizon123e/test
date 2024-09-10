const { Server } = require("socket.io");
const jwt = require("../utils/jwt");
const Chat = require("../models/model-chat");
const User = require("../models/model-auth-user");
const Distributtor = require("../models/distributor/model-distributor");
const Konsumen = require("../models/konsumen/model-konsumen");
const Produsen = require("../models/produsen/model-produsen");
const Supplier = require("../models/supplier/model-supplier");
const Vendor = require("../models/vendor/model-vendor");


const io = new Server({
  cors: {
    origin: "*",
  },
  allowedHeaders: ["Chat Header"],
});

io.use(async(socket, next) => {
  try {
    if(socket.handshake.auth.fromServer){
      socket.user = { id: '1',  email: { content: null } }
      socket.id = socket.user.id
      return next()
    }
    const token = socket.handshake.auth.token;
    const verifyToken = jwt.verifyToken(token);
    if (!verifyToken) return next(new Error("Authentication error"));
    socket.user = verifyToken;
    socket.id = socket.user.id
    next();
  } catch (error) {
    next(error)
  }
});

const userConnected = [];

io.on("connection", (socket) => {
  socket.emit("hello", `Halo Selamat Datang, ${JSON.stringify(socket.user)}`);
  socket.on("status_user", async (data)=> {
    if(userConnected.some(usr => usr.id === data)){
      socket.emit('status_user', { online: true, lastOnline: new Date() })
    }else{
      const user = await User.findById(data).select("lastOnline")
      socket.emit('status_user', { online: false, lastOnline: new Date(user.lastOnline) })
    }
  })
  if(!userConnected.some(user => user.id === socket.id)) {
    userConnected.push(socket.user); 
  }

  socket.on("disconnect", (reason) => {
    const index = userConnected.findIndex((user) => user.id === socket.id);
    if (index > -1) userConnected.splice(index, 1);
    User.updateOne(
      { _id: socket.user.id },
      { lastOnline: new Date() }
    )
    .then(()=>console.log("berhasil update last login"))
    .catch((e)=> console.log("gagal update last login"))
    console.log('ada yang logout dengan socket id: ', socket.id)
  });

  socket.on("send msg", async (data) => {
    const { userId, ...contents } = data;
    try {
        const receiver = await User.findById(userId).select("role");
        const senderRole = socket.user.role;
        const receiverRole = receiver.role;

        if (senderRole !== 'distributor' && receiverRole !== 'distributor') {
          return socket.emit("error", 'Anda hanya dapat mengirim pesan kepada distributor.');
        }

        let chat = await Chat.findOne({
          participants: { $all: [socket.user.id, userId] }
        });

        const message = {
          sender: socket.user.id,
          content: JSON.stringify(contents),
          timestamp: new Date(Date.now()).toISOString()
        };

        if (chat) {
          chat.messages.push(message);
          chat.save().then(()=> console.log("Berhasil Menyimpan Chat")).catch((err)=> console.log("Gagal Menyimpan Chat", err));
        } else {
          chat = new Chat({
            participants: [userId, socket.user.id],
            messages: [message]
          });
          chat.save().then(()=> console.log("Berhasil Menyimpan Chat")).catch((err)=> console.log("Gagal Menyimpan Chat", err));
        }

        const { sender, ...rest } = message;

        let senderDetail;
        let detail;

        switch (socket.user.role) {
          case "konsumen":
            detail = await Konsumen.findOne({ userId: sender }).select("profile_pict namaBadanUsaha userId nama").lean();
            if (!detail) {
                return ({ message: "Detail konsumen tidak ditemukan" });
            }
            senderDetail = { userId: detail.userId , role: socket.user.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
            break;    
          case "vendor":
            detail = await Vendor.findOne({ userId: sender }).select("profile_pict namaBadanUsaha userId nama").lean();
            if (!detail) {
                return ({ message: "Detail vendor tidak ditemukan" });
            }
            senderDetail = { userId: detail.userId , role: socket.user.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
            break;    
          case "supplier":
            detail = await Supplier.findOne({ userId: sender }).select("profile_pict namaBadanUsaha userId nama").lean();
            if (!detail) {
                return ({ message: "Detail supplier tidak ditemukan" });
            }
            senderDetail = { userId: detail.userId , role: socket.user.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
            break;    
          case "produsen":
            detail = await Produsen.findOne({ userId: sender }).select("profile_pict namaBadanUsaha userId nama").lean();
            if (!detail) {
                return ({ message: "Detail produsen tidak ditemukan" });
            }
            senderDetail = { userId: detail.userId , role: socket.user.role , profile_pict: detail.profile_pict, nama: detail.namaBadanUsaha || detail.nama };
            break;    
          case "distributor":
            detail = await Distributtor.findOne({ userId: sender }).select("imageProfile nama_distributor userId").lean();
            if (!detail) {
                return ({ message: "Detail distributor tidak ditemukan", });
            }
            senderDetail = { userId: detail.userId , role: socket.user.role , profile_pict: detail.imageProfile, nama: detail.nama_distributor };
            break;    
          default:
            return ({ message: "Role tidak dikenali" });  
        };

        io.to(socket.user.id).emit(`msg`, JSON.stringify({ sender: senderDetail, chatId: chat._id, ...rest}));
        io.to(userId).emit(`msg`, JSON.stringify({ sender: senderDetail, chatId: chat._id, ...rest}));

    } catch (err) {
      console.log('Gagal menyimpan chat', err);
      socket.emit("error", 'Terjadi kesalahan dalam mengirim pesan.');
    }
  });

  socket.on('notif_order', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_order', JSON.stringify({...rest}))
  })

  // SOCKER NOTIFIKASI PADA KONSUMEN
  socket.on('notif_pesanan_selesai', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_selesai', JSON.stringify({...rest}));
  })
  socket.on('notif_pesanan_berhasil', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_berhasil', JSON.stringify({...rest})); 
  })
  socket.on('notif_selesaikan_pembayaran', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_selesaikan_pembayaran', JSON.stringify({...rest}));
  })
  socket.on('notif_pesanan_dikonfirmasi', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_dikonfirmasi', JSON.stringify({...rest}));
  })
  socket.on('notif_pesanan_dikemas', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_dikemas', JSON.stringify({...rest}))
  })
  socket.on('notif_pesanan_diserahkan', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_diserahkan', JSON.stringify({...rest}))
  })
  socket.on('notif_pesanan_dikirim', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_dikirim', JSON.stringify({...rest}))
  })
  socket.on('notif_pesanan_diterima', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_diterima', JSON.stringify({...rest}));
  })
  socket.on('notif_pesanan_selesai', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_selesai', JSON.stringify({...rest}))
  })
  socket.on('notif_pembayaran_berhasil', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pembayaran_berhasil', JSON.stringify({...rest}));
  })
  socket.on('notif_pesanan_dibatalkan', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pesanan_dibatalkan', JSON.stringify({...rest}));
  })

  // SOCKER NOTIFIKASI PADA VENDOR 
  socket.on('notif_vendor_pesanan_masuk', async(data) => {
    const {userId, ...rest} = data
    console.log(userConnected.some(user => user.id === userId))
    console.log(data)
    io.to(userId).emit('notifikasi_vendor_pesanan_masuk', JSON.stringify({...rest}));
  })
  socket.on('notif_vendor_distributor_menjemput', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_vendor_distributor_menjemput', JSON.stringify({...rest}));
  })
  socket.on('notif_vendor_pesanan_dikirim', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_vendor_pesanan_dirikim', JSON.stringify({...rest}));
  })
  // SOCKET NOTIFIKASI PADA DISTRIBUTOR
  socket.on('notif_distri_pengiriman_baru', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_distri_pengiriman_baru', JSON.stringify({...rest}));
  })
  socket.on('notif_distri_h-1_pengiriman', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_distri_h-1_pengiriman', JSON.stringify({...rest}));
  })
  socket.on('notif_distri_pesanan_dikemas', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_distri_pesanan_dikemas', JSON.stringify({...rest}));
  })
  socket.on('notif_distri_pesanan_dikirim', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_distri_pesanan_dikirim', JSON.stringify({...rest}))
  })
  socket.on('notif_distri_pesanan_selesai', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_distri_pesanan_selesai', JSON.stringify({...rest}));
  })
  socket.on('notif_distri_sudah_dikemas', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_distri_sudah_dikemas', JSON.stringify({...rest}));
  })
});

module.exports = io;
