#!/usr/bin/env node

import amqp from 'amqplib'

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: receive_logs_topic.js <facility>.<severity>");
  process.exit(1);
}

async function main() {
  const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
  const channel = await connection.createChannel();

  const exchange = 'auth_exchange';

  await channel.assertExchange(exchange, 'topic', {
    durable: true
  });

  const q = await channel.assertQueue('', {
    exclusive: true
  });
  console.log(' [*] Waiting for logs. To exit press CTRL+C');

  for (const key of args) {
    await channel.bindQueue(q.queue, exchange, key);
  }

  channel.consume(q.queue, function (msg) {
    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
  }, {
    noAck: true
  });
}

main();