import amqp from "amqplib";

let connection = null;
let channel = null;

/**
 * Devuelve un canal de RabbitMQ reutilizando la conexión existente.
 * Si no existe o se cayó, crea una nueva.
 */
export const getMQChannel = async () => {
  if (channel) return channel;

  connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  // Si la conexión se cierra inesperadamente, limpiamos referencias
  connection.on("close", () => {
    console.warn("[RabbitMQ] Connection closed — will reconnect on next call");
    connection = null;
    channel = null;
  });

  connection.on("error", (err) => {
    console.error("[RabbitMQ] Connection error:", err.message);
    connection = null;
    channel = null;
  });

  return channel;
};
