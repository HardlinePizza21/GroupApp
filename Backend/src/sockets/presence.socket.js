import { userConnected, userDisconnected, getOnlineUsers } from './presence.store.js';

export default function presenceSocket(socket, io) {
  const userId = socket.user.id;

  // Usuario conectado
  userConnected(userId, socket.id);

  // Notificar a todos
  io.emit("presence:online", {
    userId,
    onlineUsers: getOnlineUsers()
  });

  // Desconexión
  socket.on("disconnect", () => {
    const disconnectedUser = userDisconnected(socket.id);

    if (disconnectedUser) {
      io.emit("presence:offline", {
        userId: disconnectedUser
      });
    }
  });
}