import prisma from "../config/db.js";

export default function messageHandler(socket, io) {

  socket.on("join_channel", (channelId) => {
    socket.join(`channel_${channelId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { channelId, content } = data;

      const message = await prisma.message.create({
        data: {
          content: content || null,
          senderId: socket.user.userId,
          channelId: parseInt(channelId),
          status: "SENT"
        },
        include: {
          sender: {
            select: { id: true, username: true }
          }
        }
      });

      io.to(`channel_${channelId}`).emit("receive_message", message);

    } catch (err) {
      console.error(err);
      socket.emit("error", { message: "Error enviando mensaje" });
    }
  });
}