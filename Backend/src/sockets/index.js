import { Server } from "socket.io";
import authSocket from "./auth.socket.js";
import messageHandler from "./message.socket.js";

export default function initSockets(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  authSocket(io);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.userId);

    messageHandler(socket, io);
  });
}