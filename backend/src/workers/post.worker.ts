import { prisma } from '../db.js';
import { publishToPlatform } from '../services/publisher.service.js';
import { getRabbitChannel, QUEUE_NAME } from './queue.js';

export async function startWorker(): Promise<void> {
  const channel = await getRabbitChannel();
  console.log(`[Worker] Listening on queue: ${QUEUE_NAME}`);

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;

      try {
        const { postId } = JSON.parse(msg.content.toString()) as { postId: string };
        const post = await prisma.post.findUnique({
          where: { id: postId },
          include: { targets: { include: { channel: true } } },
        });

        if (!post) {
          channel.ack(msg);
          return;
        }

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

        channel.ack(msg);
      } catch (error) {
        console.error('[Worker] Error processing post:', error);
        // Negative acknowledge with requeue=false to avoid infinite loop
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}

