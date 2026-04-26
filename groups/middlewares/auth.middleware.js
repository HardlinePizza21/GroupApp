import { getMQChannel } from "../src/config/rabbitmq.js"
import { v4 as uuidv4 } from "uuid"

export default async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {

    const channel = await getMQChannel();
    //*Para poder usar RabbitMQ como servicio RPC el servicio/cliente, debe manejar la consistencia de los mensajes

    const correlationId = uuidv4();

    const decoded = await new Promise((resolve) => {
      // Consume from the Direct Reply-to pseudo-queue (automatic acknowledgement mode is mandatory)
      channel.consume('amq.rabbitmq.reply-to', (msg) => {
        if (msg.properties.correlationId === correlationId) {
          resolve(msg.content.toString());
        }
      }, { noAck: true });

      channel.sendToQueue('rpc_queue',
        Buffer.from(token), {
        correlationId: correlationId,
        replyTo: 'amq.rabbitmq.reply-to'
      });
    });

    console.log("User decoded: ", JSON.parse(decoded))

    req.user = JSON.parse(decoded);

    next();
  } catch(error) {
    res.status(401).json({ error });
    console.error(error)
  }
}