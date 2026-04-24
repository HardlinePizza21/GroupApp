import amqp from 'amqplib'

export const getMQChannel = async () => {

    const connection = await amqp.connect(process.env.RABBITMQ_URL)
    const channel = await connection.createChannel()

    return channel
}
