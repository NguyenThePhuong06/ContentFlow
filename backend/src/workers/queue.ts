import amqp, { Channel, ChannelModel } from 'amqplib';
import { processPostJob } from './post.worker.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'contentflow_posts';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isRabbitAvailable = true;

export async function getRabbitChannel(): Promise<Channel | null> {
  if (channel) return channel;
  if (!isRabbitAvailable) return null;

  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    connection = conn;
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE_NAME, { durable: true });
    channel = ch;
    return channel;
  } catch {
    isRabbitAvailable = false;
    console.warn(`[Queue] RabbitMQ not reachable at ${RABBITMQ_URL}. Falling back to In-Memory Queue.`);
    return null;
  }
}

export async function enqueuePost(postId: string): Promise<void> {
  const ch = await getRabbitChannel();
  if (ch) {
    ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ postId })), { persistent: true });
    console.log(`[Queue] Enqueued post ${postId} via RabbitMQ`);
  } else {
    // Lean In-Memory asynchronous execution fallback
    console.log(`[Queue] Processing post ${postId} via In-Memory Direct Queue`);
    setImmediate(async () => {
      try {
        await processPostJob(postId);
      } catch (err) {
        console.error(`[In-Memory Queue] Error processing post ${postId}:`, err);
      }
    });
  }
}

export { QUEUE_NAME, connection };
