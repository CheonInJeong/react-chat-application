const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
  getUsersInRoom,
} = require("./users.js");

const router = require("./router");
const app = express();
app.use(cors());
app.use(router);
const server = http.createServer(app);

const corsOpt = {
  origin: "http://localhost:3000",
  credentials: true,
};

const io = socketio(server, {
  cors: corsOpt,
});

const PORT = process.env.PORT || 5000;

io.on("connect", (socket) => {
  console.log(`we have a new connection!`);

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    console.log("join user", user);
    if (error) return callback(error); //join 이벤트를 받고 나서 클라이언트쪽의 함수를 실행시킨다.
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to the room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    callback();
    socket.join(user.room);
    socket
      .to(user.room)
      .emit("roomData", { room: user.room, users: getUsersInRoom(user.room) });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    console.log(user, "sendMessage user");
    io.to(user?.room).emit("message", { user: user?.name, text: message });
    io.to(user?.room).emit("roomData", {
      room: user?.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });
  socket.on("disconnect", () => {
    console.log(`user had left:(`);
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
