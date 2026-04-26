import { getMQChannel } from "../config/rabbitmq.js";

const EXCHANGE = "messages_exchange";
const KEY = "message.sent";

export const consumeMessageEvents = async (io) => {
  const channel = await getMQChannel();

  // Asegurar que el exchange existe
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  // Crear cola exclusiva para este servicio
  const queue = await channel.assertQueue("", { exclusive: true });

  // Bindear al exchange
  await channel.bindQueue(queue.queue, EXCHANGE, KEY);

  console.log(`[RabbitMQ] Bound to ${EXCHANGE}/${KEY}`);

  // Consumir mensajes
  channel.consume(queue.queue, (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      const { channelId, message } = event;

      // Emitir solo IDs mínimos a los clientes del canal
      const room = `channel:${channelId}`;
      io.to(room).emit("receive_message", {
        messageId: message.id,
        channelId: channelId,
        timestamp: new Date().toISOString()
      });

      console.log(
        `✓ [Socket] Notified ${room} about message ${message.id}`
      );
    } catch (err) {
      console.error("[RabbitMQ Consumer] Error:", err.message);
    }

    channel.ack(msg);
  });
};
