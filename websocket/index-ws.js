const { Server } = require("socket.io");
const jwt = require("../utils/jwt");

const io = new Server({
  cors: {
    origin: "*",
  },
  allowedHeaders: ["Chat Header"],
});

io.use((socket, next) => {
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
    socket.id = socket.user.id;
    next();
  } catch (error) {
    next(error)
  }
});

const userConnected = [];

io.on("connection", (socket) => {
  socket.emit("hello", `Halo Selamat Datang, ${JSON.stringify(socket.user)}`);
  
  if(!userConnected.some(user => user.id === socket.id)) {
    userConnected.push(socket.user); 
  }

  console.log(
    `${userConnected.length} ${
      userConnected.length > 1 ? "users" : "user"
    } succesfully connected`
  );

  socket.on("disconnect", (reason) => {
    const index = userConnected.findIndex((user) => user.id === socket.id);
    console.log('index nya: ',index)
    if (index > -1) userConnected.splice(index, 1);
    console.log('ada yang logout dengan socket id: ', socket.id)
  });

  socket.on("send msg", async (data, callback) => {
    const { userEmail, msg } = data;
    console.log(userConnected)

    const foundUser = userConnected.find(
      (user) => user.email.content == userEmail
    );

    // const chat = await Conversation.findOne({
    //   participants: { $all: [foundUser.id, socket.id] },
    // });
    // if (!chat) {
    //   await Conversation.create({
    //     participants: [foundUser.id, socket.id],
    //     messages: [
    //       {
    //         sender: socket.id,
    //         content: msg,
    //       },
    //     ],
    //   });
    // } else {
    //   chat.messages.push({
    //     sender: socket.id,
    //     content: msg,
    //   });
    //   await chat.save();
    // }
    if (foundUser) {
      io.to(socket.id).emit("msg", msg);
      io.to(foundUser.id).emit("msg", msg);
    }
  });

  socket.on('notif_order', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_order', JSON.stringify({...rest}))
  })
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
  socket.on('notif_pembayaran_berhasil', async(data) => {
    const {userId, ...rest} = data
    console.log(data)
    io.to(userId).emit('notifikasi_pembayaran_berhasil', JSON.stringify({...rest}));
  })
});

module.exports = io;
