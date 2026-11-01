"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
exports.stopScheduler = stopScheduler;
const db_js_1 = require("../db.js");
const queue_js_1 = require("./queue.js");
let intervalId = null;
/**
 * Lean Cron Scheduler: Checks for due scheduled posts every 15 seconds
 */
function startScheduler(intervalMs = 15000) {
    if (intervalId)
        return;
    console.log(`⏱️ [Scheduler] Background post scheduler started (interval: ${intervalMs / 1000}s)`);
    intervalId = setInterval(async () => {
        try {
            const now = new Date();
            const duePosts = await db_js_1.prisma.post.findMany({
                where: {
                    status: 'SCHEDULED',
                    scheduledAt: { lte: now },
                },
                take: 20,
            });
            for (const post of duePosts) {
                console.log(`⏱️ [Scheduler] Dispatching due scheduled post: ${post.id}`);
                // Temporarily mark as processing to avoid duplicate enqueue
                await db_js_1.prisma.post.update({
                    where: { id: post.id },
                    data: { status: 'DRAFT' }, // temporarily update status during processing
                });
                await (0, queue_js_1.enqueuePost)(post.id);
            }
        }
        catch (err) {
            console.error('[Scheduler] Error scanning scheduled posts:', err);
        }
    }, intervalMs);
}
function stopScheduler() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}
