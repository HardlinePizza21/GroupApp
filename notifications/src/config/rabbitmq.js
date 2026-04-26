import amqp from "amqplib";

let connection = null;
let channel = null;

export const getMQChannel = async () => {
  if (channel) return channel;

  connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  connection.on("close", () => {
    console.warn("[RabbitMQ] Connection closed");
    connection = null;
    channel = null;
  });

  connection.on("error", (err) => {
    console.error("[RabbitMQ] Error:", err.message);
    connection = null;
    channel = null;
  });

  return channel;
};
