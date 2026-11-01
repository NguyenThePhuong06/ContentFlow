import { prisma } from '../db.js';
import { enqueuePost } from './queue.js';

let intervalId: NodeJS.Timeout | null = null;

/**
 * Lean Cron Scheduler: Checks for due scheduled posts every 15 seconds
 */
export function startScheduler(intervalMs = 15000): void {
  if (intervalId) return;

  console.log(`⏱️ [Scheduler] Background post scheduler started (interval: ${intervalMs / 1000}s)`);

  intervalId = setInterval(async () => {
    try {
      const now = new Date();
      const duePosts = await prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lte: now },
        },
        take: 20,
      });

      for (const post of duePosts) {
        console.log(`⏱️ [Scheduler] Dispatching due scheduled post: ${post.id}`);
        // Temporarily mark as processing to avoid duplicate enqueue
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'DRAFT' }, // temporarily update status during processing
        });
        await enqueuePost(post.id);
      }
    } catch (err) {
      console.error('[Scheduler] Error scanning scheduled posts:', err);
    }
  }, intervalMs);
}

export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

