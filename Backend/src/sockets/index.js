//! If you're behind a reverse proxy such as apache or nginx please take a look at the documentation for it. https://socket.io/docs/v4/reverse-proxy/

//!If you're hosting your app in a folder that is not the root of your website (e.g., https://example.com/chatapp) then you also need to specify the path in both the server and the client.
//!https://socket.io/docs/v4/server-options/#path
import { Server } from "socket.io";
import authSocket from "./auth.socket.js";
import messageHandler from "./message.socket.js";
import presenceSocket from "./presence.socket.js";

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
    presenceSocket(socket, io)
  });
}