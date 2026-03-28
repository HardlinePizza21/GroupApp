export default function messageHandler(socket, io) {

  socket.on("join_channel", (channelId) => {
    socket.join(channelId);
  });

  socket.on("send_message", (data) => {
    const message = {
      ...data,
      senderId: socket.user.userId
    };

    io.to(data.channelId).emit("receive_message", message);
  });

}