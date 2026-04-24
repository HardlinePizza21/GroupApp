import { verifyToken } from "../utils/jwt.js";
import { getMQChannel } from "../src/config/rabbitmq.js"
import { v4 as uuidv4 } from "uuid"

export default function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);

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
        Buffer.from(jwt), {
        correlationId: correlationId,
        replyTo: 'amq.rabbitmq.reply-to'
      });
    });

    console.log("User decoded: ", JSON.stringify(decoded, undefined, 1))

    req.user = decoded;

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}