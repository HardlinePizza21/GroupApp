import { Server } from "socket.io";
import authSocket from "./auth.socket.js";
import messageHandler from "./message.socket.js";

export default function initSockets(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  authSocket(io);

  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    const userId = socket.user.userId;

    onlineUsers.add(userId);

    io.emit("user_online", userId);

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user_offline", userId);
    });

    messageHandler(socket, io);
  });
}