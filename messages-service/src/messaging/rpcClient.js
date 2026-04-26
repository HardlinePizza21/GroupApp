import { getMQChannel } from "../config/rabbitmq.js";
import { v4 as uuidv4 } from "uuid";

const RPC_QUEUE   = "rpc_queue";   // La misma queue que expone el auth service
const RPC_TIMEOUT = 8000;          // 8 s antes de rechazar

/**
 * Envía el token JWT al servicio de auth por RPC y espera la respuesta.
 *
 * @param {string} token  — JWT access token
 * @returns {Promise<object>} payload decodificado (userId, iat, exp…)
 * @throws {Error} si el token es inválido o el timeout expira
 */
export const verifyTokenRPC = (token) => {
  return new Promise(async (resolve, reject) => {
    const correlationId = uuidv4();
    let timeoutId;

    try {
      const channel = await getMQChannel();

      // Cola de respuesta exclusiva y auto-eliminada para esta request
      const { queue: replyQueue } = await channel.assertQueue("", {
        exclusive: true,
        autoDelete: true,
      });

      // Timeout para no quedar esperando si el auth service no responde
      timeoutId = setTimeout(() => {
        reject(new Error("RPC timeout: auth service did not respond"));
      }, RPC_TIMEOUT);

      // Escuchar la respuesta en nuestra cola temporal
      channel.consume(
        replyQueue,
        (msg) => {
          if (!msg) return;
          if (msg.properties.correlationId !== correlationId) return;

          clearTimeout(timeoutId);

          const payload = JSON.parse(msg.content.toString());

          if (payload.error) {
            reject(new Error(payload.message || payload.error));
          } else {
            resolve(payload);
          }
        },
        { noAck: true }
      );

      // Enviar el token al auth service
      channel.sendToQueue(RPC_QUEUE, Buffer.from(token), {
        correlationId,
        replyTo: replyQueue,
        persistent: false,          // No necesitamos que sobreviva reinicios
      });

    } catch (err) {
      clearTimeout(timeoutId);
      reject(err);
    }
  });
};
