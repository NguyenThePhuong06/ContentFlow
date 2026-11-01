"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const jwt_js_1 = require("../utils/jwt.js");
const queue_js_1 = require("../workers/queue.js");
const ai_service_js_1 = require("../services/ai.service.js");
const crypto_js_1 = require("../utils/crypto.js");
const CreatePostSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content cannot be empty'),
    channelIds: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one channel'),
    scheduledAt: zod_1.z.string().datetime().optional(),
});
const GenerateDraftSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(2, 'Prompt must be at least 2 characters'),
    tone: zod_1.z.string().optional(),
});
/**
 * Lean helper to ensure default user and channels exist for immediate testing
 */
async function ensureDefaultUserAndChannels(userId) {
    // 1. Ensure user exists
    await db_js_1.prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            email: 'admin@contentflow.io',
            password: 'default_hashed_password',
        },
    });
    // 2. Ensure channels exist for this user
    const channelCount = await db_js_1.prisma.channel.count({ where: { userId } });
    if (channelCount === 0) {
        const defaultChannels = [
            { platform: 'FACEBOOK', name: 'Facebook Page Demo', accountId: 'fb_page_demo_101' },
            { platform: 'LINKEDIN', name: 'LinkedIn Company Demo', accountId: 'li_org_demo_202' },
            { platform: 'TWITTER', name: 'X / Twitter Feed Demo', accountId: 'tw_feed_demo_303' },
        ];
        for (const ch of defaultChannels) {
            const encrypted = (0, crypto_js_1.encrypt)('demo_oauth_access_token_token123');
            await db_js_1.prisma.channel.create({
                data: {
                    userId,
                    platform: ch.platform,
                    accountName: ch.name,
                    platformAccountId: ch.accountId,
                    encryptedToken: encrypted.ciphertext,
                    tokenIv: encrypted.iv,
                    tokenAuthTag: encrypted.authTag,
                },
            });
        }
    }
}
exports.PostController = {
    // GET /api/channels
    async listChannels(req, res) {
        try {
            const userId = req.user?.userId || jwt_js_1.DEFAULT_DEV_USER.userId;
            await ensureDefaultUserAndChannels(userId);
            const channels = await db_js_1.prisma.channel.findMany({
                where: { userId },
                select: {
                    id: true,
                    platform: true,
                    accountName: true,
                    platformAccountId: true,
                },
            });
            res.json(channels);
        }
        catch (err) {
            console.error('[PostController.listChannels] Error:', err);
            res.status(500).json({ error: 'Failed to fetch channels' });
        }
    },
    // GET /api/posts
    async list(req, res) {
        try {
            const userId = req.user?.userId || jwt_js_1.DEFAULT_DEV_USER.userId;
            await ensureDefaultUserAndChannels(userId);
            const posts = await db_js_1.prisma.post.findMany({
                where: { userId },
                include: { targets: { include: { channel: true } } },
                orderBy: { createdAt: 'desc' },
            });
            res.json(posts);
        }
        catch (err) {
            console.error('[PostController.list] Error:', err);
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
    },
    // POST /api/posts
    async create(req, res) {
        const parsed = CreatePostSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        try {
            const { content, channelIds, scheduledAt } = parsed.data;
            const userId = req.user?.userId || jwt_js_1.DEFAULT_DEV_USER.userId;
            await ensureDefaultUserAndChannels(userId);
            const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
            const isFutureSchedule = scheduledDate && scheduledDate.getTime() > Date.now();
            const post = await db_js_1.prisma.post.create({
                data: {
                    userId,
                    content,
                    scheduledAt: scheduledDate,
                    status: isFutureSchedule ? 'SCHEDULED' : 'SCHEDULED',
                    targets: {
                        create: channelIds.map((channelId) => ({
                            channelId,
                            status: 'SCHEDULED',
                        })),
                    },
                },
                include: { targets: { include: { channel: true } } },
            });
            // If immediate or scheduled for past/now, push directly to queue worker
            if (!isFutureSchedule) {
                await (0, queue_js_1.enqueuePost)(post.id);
            }
            res.status(201).json(post);
        }
        catch (err) {
            console.error('[PostController.create] Error:', err);
            res.status(500).json({ error: 'Failed to create post', details: String(err) });
        }
    },
    // POST /api/posts/ai-generate
    async generateAI(req, res) {
        const parsed = GenerateDraftSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        try {
            const content = await (0, ai_service_js_1.generateContent)(parsed.data.prompt, parsed.data.tone);
            res.json({ content });
        }
        catch (err) {
            console.error('[PostController.generateAI] Error:', err);
            res.status(500).json({ error: 'Failed to generate AI content' });
        }
    },
};
