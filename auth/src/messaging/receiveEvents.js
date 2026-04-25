//* En este archivos se encuentra una funcion que permite RPC por medio de rabbitMQ
//* Esto con el fin de ofrecer validacion para el JWT 
import { getMQChannel } from "../config/rabbitmq.js";
import { verifyToken } from "../utils/jwt.js";

export const startJWTRpcConsumer = async () => {
    const channel = await getMQChannel();

    const queue = 'rpc_queue'

    await channel.assertQueue(queue, {
        durable: true,
        arguments: {
            'x-queue-type': 'quorum'
        }
    });

    channel.prefetch(1);

    console.log('[] Awaiting JWT verifications. To exit press CTRL+C');

    //*Queue para simular RPC en RabbitMQ
    channel.consume(queue, function reply(msg) {

        try {
            const result = verifyToken(msg.content.toString(), process.env.JWT_SECRET)
            
            console.log('Token verified:', result)

            channel.sendToQueue(msg.properties.replyTo,
                Buffer.from(JSON.stringify(result)), {
                correlationId: msg.properties.correlationId
            });

        } catch (error) {
            console.error('Token verification failed:', error.message)
            
            channel.sendToQueue(msg.properties.replyTo,
                Buffer.from(JSON.stringify({ 
                    error: 'Invalid token',
                    message: error.message 
                })), {
                correlationId: msg.properties.correlationId
            });
        }

        channel.ack(msg);
    });

}
