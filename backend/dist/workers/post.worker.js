"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPostJob = processPostJob;
exports.startWorker = startWorker;
const db_js_1 = require("../db.js");
const publisher_service_js_1 = require("../services/publisher.service.js");
const queue_js_1 = require("./queue.js");
async function processPostJob(postId) {
    const post = await db_js_1.prisma.post.findUnique({
        where: { id: postId },
        include: { targets: { include: { channel: true } } },
    });
    if (!post)
        return;
    let allSuccess = true;
    for (const target of post.targets) {
        try {
            const result = await (0, publisher_service_js_1.publishToPlatform)({
                channel: target.channel,
                content: post.content,
            });
            await db_js_1.prisma.postTarget.update({
                where: { id: target.id },
                data: {
                    status: 'PUBLISHED',
                    platformPostId: result.platformPostId,
                    publishedAt: new Date(),
                },
            });
        }
        catch (err) {
            allSuccess = false;
            const message = err instanceof Error ? err.message : 'Unknown error';
            await db_js_1.prisma.postTarget.update({
                where: { id: target.id },
                data: { status: 'FAILED', errorMessage: message },
            });
        }
    }
    await db_js_1.prisma.post.update({
        where: { id: post.id },
        data: { status: allSuccess ? 'PUBLISHED' : 'FAILED' },
    });
}
async function startWorker() {
    const channel = await (0, queue_js_1.getRabbitChannel)();
    if (!channel) {
        console.log('[Worker] Running in In-Memory mode (RabbitMQ offline).');
        return;
    }
    console.log(`[Worker] Listening on RabbitMQ queue: ${queue_js_1.QUEUE_NAME}`);
    channel.consume(queue_js_1.QUEUE_NAME, async (msg) => {
        if (!msg)
            return;
        try {
            const { postId } = JSON.parse(msg.content.toString());
            await processPostJob(postId);
            channel.ack(msg);
        }
        catch (error) {
            console.error('[Worker] Error processing post:', error);
            channel.nack(msg, false, false);
        }
    }, { noAck: false });
}
