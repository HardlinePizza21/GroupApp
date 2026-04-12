import * as messageService from "../modules/messages/message.service.js";

export default function messageHandler(socket, io) {

  socket.on("join_channel", (channelId) => {
    socket.join(channelId);
  });

  socket.on("chat_message", async (data) => {
    try {
      const userId = socket.user.id;

      // 2. Emitir evento ligero (NO mandar todo el mensaje)
      io.to(data.channelId).emit("message:new", {
        messageId: message.id,
        channelId: data.channelId,
        senderId: userId,
        createdAt: message.createdAt
      });

    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Error enviando mensaje" });
    }
  });
}