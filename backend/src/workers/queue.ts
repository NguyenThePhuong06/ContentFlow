import amqp, { Channel, Connection } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'contentflow_posts';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function getRabbitChannel(): Promise<Channel> {
  if (channel) return channel;
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return channel;
}

export async function enqueuePost(postId: string): Promise<void> {
  const ch = await getRabbitChannel();
  ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ postId })), { persistent: true });
}

export { QUEUE_NAME };

