//!Esto es un ejemplo de como consumir el RPC 
import amqp from 'amqplib'
import { v4 as uuidv4 } from "uuid";


const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
const channel = await connection.createChannel();

const correlationId = uuidv4();
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NzA3ODI4OSwiZXhwIjoxNzc3MDgxODg5fQ.yNc6o2YRth5JlfHnj6Y4NcZ7kG4A1eTTUhORtgL53o0';

console.log('[x] Requesting verification ', jwt);

const result = await new Promise((resolve) => {
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

console.log(' [.] Got %s', result);
await connection.close();
