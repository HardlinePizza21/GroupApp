import { getMQChannel } from "../config/rabbitmq.js";

const EXCHANGE = "messages_exchange"; // Exchange que consume el servicio de Socket.IO
const KEY      = "message.sent";

/**
 * Publica un evento cada vez que se crea un mensaje.
 * El servicio de Socket.IO escucha este exchange y hace el broadcast
 * a todos los clientes conectados al canal correspondiente.
 *
 * Payload que recibirá el servicio de Socket.IO:
 * {
 *   channelId : number,
 *   message   : { id, content, fileUrl, fileType, status, senderId, createdAt, sender }
 * }
 */
export const emitMessageSentEvent = async (channelId, message) => {
  let channel = null;

  try {
    channel = await getMQChannel();

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });

    const payload = JSON.stringify({
      channelId,
      message,
      timestamp: new Date().toISOString(),
    });

    const published = channel.publish(
      EXCHANGE,
      KEY,
      Buffer.from(payload),
      { persistent: true }       // El evento sobrevive reinicios del broker
    );

    if (published) {
      console.log(`✓ [RabbitMQ] message.sent emitted → channel ${channelId}`);
    } else {
      console.warn("⚠ [RabbitMQ] Buffer full, message queued internally");
    }

  } catch (err) {
    // No interrumpimos la respuesta HTTP por un fallo del broker
    console.error("✗ [RabbitMQ] Error emitting message.sent:", err.message);
  }
};
