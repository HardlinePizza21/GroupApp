import { getMQChannel } from '../config/rabbitmq.js';

export const emitCreateUserEvent = async (userId) => {
    let connection = null;
    let channel = null;
    try {

        const channel = await getMQChannel();

        if (!userId) {
            throw new Error('Se debe mandar el id del usuario que se conectó a RabbitMQ')
        }

        const exchange = 'auth_exchange';
        const key = 'user.created';
        const msg = JSON.stringify({ userId, timestamp: new Date().toISOString() })

        await channel.assertExchange(exchange, 'topic', {
            durable: true
        });

        const published = channel.publish(exchange, key, Buffer.from(msg));

        if (published) {
            console.log('✓ [RabbitMQ] Message emitted:', msg);
        } else {
            console.warn('⚠ [RabbitMQ] Buffer full, message queued');
        }

    } catch (error) {
        console.error('✗ [RabbitMQ] Error emitting user created event:', error.message);
        if (channel) await channel.close().catch(() => { });
        if (connection) await connection.close().catch(() => { });
        throw error;
    }
}