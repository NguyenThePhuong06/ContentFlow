import { prisma } from '../db.js';
import { publishToPlatform } from '../services/publisher.service.js';
import { getRabbitChannel, QUEUE_NAME } from './queue.js';

export async function processPostJob(postId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { targets: { include: { channel: true } } },
  });

  if (!post) return;

  let allSuccess = true;

  for (const target of post.targets) {
    try {
      const result = await publishToPlatform({
        channel: target.channel,
        content: post.content,
      });

      await prisma.postTarget.update({
        where: { id: target.id },
        data: {
          status: 'PUBLISHED',
          platformPostId: result.platformPostId,
          publishedAt: new Date(),
        },
      });
    } catch (err: unknown) {
      allSuccess = false;
      const message = err instanceof Error ? err.message : 'Unknown error';
      await prisma.postTarget.update({
        where: { id: target.id },
        data: { status: 'FAILED', errorMessage: message },
      });
    }
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { status: allSuccess ? 'PUBLISHED' : 'FAILED' },
  });
}

export async function startWorker(): Promise<void> {
  const channel = await getRabbitChannel();
  if (!channel) {
    console.log('[Worker] Running in In-Memory mode (RabbitMQ offline).');
    return;
  }

  console.log(`[Worker] Listening on RabbitMQ queue: ${QUEUE_NAME}`);
  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;

      try {
        const { postId } = JSON.parse(msg.content.toString()) as { postId: string };
        await processPostJob(postId);
        channel.ack(msg);
      } catch (error) {
        console.error('[Worker] Error processing post:', error);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}
