"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = exports.QUEUE_NAME = void 0;
exports.getRabbitChannel = getRabbitChannel;
exports.enqueuePost = enqueuePost;
const amqplib_1 = __importDefault(require("amqplib"));
const post_worker_js_1 = require("./post.worker.js");
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'contentflow_posts';
exports.QUEUE_NAME = QUEUE_NAME;
let connection = null;
exports.connection = connection;
let channel = null;
let isRabbitAvailable = true;
async function getRabbitChannel() {
    if (channel)
        return channel;
    if (!isRabbitAvailable)
        return null;
    try {
        const conn = await amqplib_1.default.connect(RABBITMQ_URL);
        exports.connection = connection = conn;
        const ch = await conn.createChannel();
        await ch.assertQueue(QUEUE_NAME, { durable: true });
        channel = ch;
        return channel;
    }
    catch {
        isRabbitAvailable = false;
        console.warn(`[Queue] RabbitMQ not reachable at ${RABBITMQ_URL}. Falling back to In-Memory Queue.`);
        return null;
    }
}
async function enqueuePost(postId) {
    const ch = await getRabbitChannel();
    if (ch) {
        ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ postId })), { persistent: true });
        console.log(`[Queue] Enqueued post ${postId} via RabbitMQ`);
    }
    else {
        // Lean In-Memory asynchronous execution fallback
        console.log(`[Queue] Processing post ${postId} via In-Memory Direct Queue`);
        setImmediate(async () => {
            try {
                await (0, post_worker_js_1.processPostJob)(postId);
            }
            catch (err) {
                console.error(`[In-Memory Queue] Error processing post ${postId}:`, err);
            }
        });
    }
}
