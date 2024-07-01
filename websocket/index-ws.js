const { Server } = require("socket.io");
const Conversation = require("../models/model-conversation");
const jwt = require("../utils/jwt");

const io = new Server({
  path: "/websocket/",
  cors: {
    origin: "*",
  },
  allowedHeaders: ["Chat Header"],
});

io.use((socket, next) => {
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
  console.log(socket.user.email.content)

  userConnected.push(socket.user);

  console.log(
    `${userConnected.length} ${
      userConnected.length > 1 ? "users" : "user"
    } succesfully connected`
  );

  socket.on("disconnect", (reason) => {
    const index = userConnected.findIndex((user) => user.id === socket.id);
    if (index > -1) userConnected.splice(index, 1);
  });

  socket.on("send msg", async (data, callback) => {
    const { nama, msg } = data;

    const foundUser = userConnected.find(
      (user) => user.name == nama.toLowerCase()
    );
    const chat = await Conversation.findOne({
      participants: { $all: [foundUser.id, socket.id] },
    });
    if (!chat) {
      await Conversation.create({
        participants: [foundUser.id, socket.id],
        messages: [
          {
            sender: socket.id,
            content: msg,
          },
        ],
      });
    } else {
      chat.messages.push({
        sender: socket.id,
        content: msg,
      });
      await chat.save();
    }
    if (foundUser) {
      io.to(socket.id).emit("msg", msg, socket.user.name);
      io.to(foundUser.id).emit("msg", msg, socket.user.name);
      callback({
        description: "message sent and stored",
        message: `User ${nama} sedang online`,
      });
    } else {
      callback({
        description: "message not sent, but stored",
        message: `User ${nama} tidak online`,
      });
    }
  });
});

module.exports = io;
