export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`[Socket] User ${socket.userId} connected`);

    // Unirse a un canal (room)
    socket.on("join_channel", (channelId) => {
      const room = `channel:${channelId}`;
      socket.join(room);
      console.log(`[Socket] User ${socket.userId} joined ${room}`);
    });

    // Salir de un canal
    socket.on("leave_channel", (channelId) => {
      const room = `channel:${channelId}`;
      socket.leave(room);
      console.log(`[Socket] User ${socket.userId} left ${room}`);
    });

    // send_message del frontend (aquí solo lo loggear, se procesa en messages-service)
    socket.on("send_message", ({ channelId, content }) => {
      console.log(
        `[Socket] User ${socket.userId} sending to channel ${channelId}`
      );
      // En el futuro, esto podría redirigirse a messages-service vía RabbitMQ/HTTP
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User ${socket.userId} disconnected`);
    });
  });
};
