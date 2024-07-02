const { Server } = require("socket.io");
const jwt = require("../utils/jwt");

const io = new Server({
  cors: {
    origin: "*",
  },
  allowedHeaders: ["Chat Header"],
});

io.use((socket, next) => {
  if(socket.handshake.auth.fromServer){
    socket.user = { id: '1' }
    socket.id = socket.user.id
    return next()
  }
  const token = socket.handshake.auth.token;
  const verifyToken = jwt.verifyToken(token);
  if (!verifyToken) return next(new Error("Authentication error"));
  socket.user = verifyToken;
  socket.id = socket.user.id;
  next();
});

const userConnected = [];

io.on("connection", (socket) => {
  socket.emit("hello", `Halo Selamat Datang, ${JSON.stringify(socket.user)}`);

  userConnected.push(socket.user);
  console.log('user aktif', userConnected)
  console.log(
    `${userConnected.length} ${
      userConnected.length > 1 ? "users" : "user"
    } succesfully connected`
  );

  socket.on("disconnect", (reason) => {
    const index = userConnected.findIndex((user) => user.id === socket.id);
    if (index > -1) userConnected.splice(index, 1);
    console.log('ada yang logout dengan socket id: ', socket.id)
  });

  socket.on("send msg", async (data, callback) => {
    const { userEmail, msg } = data;

    const foundUser = userConnected.find(
      (user) => user.email.content == userEmail
    );

    console.log('data yang dikirim', data)
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
    const {userId, message} = data
    io.to(userId).emit('notifikasi_order', message)
  })
});

module.exports = io;
