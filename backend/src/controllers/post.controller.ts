import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { AuthRequest, DEFAULT_DEV_USER } from '../utils/jwt.js';
import { enqueuePost } from '../workers/queue.js';
import { generateContent } from '../services/ai.service.js';
import { encrypt } from '../utils/crypto.js';

const CreatePostSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  channelIds: z.array(z.string()).min(1, 'Select at least one channel').refine(
    (channelIds) => new Set(channelIds).size === channelIds.length,
    'Channels must be unique'
  ),
  scheduledAt: z.string().datetime().optional(),
});

const GenerateDraftSchema = z.object({
  prompt: z.string().min(2, 'Prompt must be at least 2 characters'),
  tone: z.string().optional(),
});

/**
 * Lean helper to ensure default user and channels exist for immediate testing
 */
async function ensureDefaultUserAndChannels(userId: string) {
  // 1. Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'admin@contentflow.io',
      password: 'default_hashed_password',
    },
  });

  // 2. Ensure basic demo channels exist for this user
  const defaultChannels = [
    { platform: 'FACEBOOK' as const, name: 'Facebook Page Demo', accountId: 'fb_page_demo_101' },
    { platform: 'LINKEDIN' as const, name: 'LinkedIn Company Demo', accountId: 'li_org_demo_202' },
    { platform: 'TWITTER' as const, name: 'X / Twitter Feed Demo', accountId: 'tw_feed_demo_303' },
  ];

  await prisma.channel.createMany({
    data: defaultChannels.map((channel) => {
      const encrypted = encrypt('demo_oauth_access_token_token123');
      return {
          userId,
          platform: channel.platform,
          accountName: channel.name,
          platformAccountId: channel.accountId,
          encryptedToken: encrypted.ciphertext,
          tokenIv: encrypted.iv,
          tokenAuthTag: encrypted.authTag,
      };
    }),
    skipDuplicates: true,
  });
}

export const PostController = {
  // GET /api/channels
  async listChannels(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || DEFAULT_DEV_USER.userId;
      await ensureDefaultUserAndChannels(userId);

      const channels = await prisma.channel.findMany({
        where: { userId },
        select: {
          id: true,
          platform: true,
          accountName: true,
          platformAccountId: true,
        },
      });
      res.json(channels);
    } catch (err) {
      console.error('[PostController.listChannels] Error:', err);
      res.status(500).json({ error: 'Failed to fetch channels' });
    }
  },

  // GET /api/posts
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || DEFAULT_DEV_USER.userId;
      await ensureDefaultUserAndChannels(userId);

      const posts = await prisma.post.findMany({
        where: { userId },
        include: {
          targets: {
            include: {
              channel: { select: { id: true, platform: true, accountName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(posts);
    } catch (err) {
      console.error('[PostController.list] Error:', err);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  },

  // POST /api/posts
  async create(req: AuthRequest, res: Response): Promise<void> {
    const parsed = CreatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const { content, channelIds, scheduledAt } = parsed.data;
      const userId = req.user?.userId || DEFAULT_DEV_USER.userId;

      await ensureDefaultUserAndChannels(userId);
      const ownedChannels = await prisma.channel.count({
        where: { userId, id: { in: channelIds } },
      });
      if (ownedChannels !== channelIds.length) {
        res.status(400).json({ error: 'One or more selected channels are unavailable' });
        return;
      }

      const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
      const isFutureSchedule = scheduledDate && scheduledDate.getTime() > Date.now();

      const post = await prisma.post.create({
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
        include: {
          targets: {
            include: {
              channel: { select: { id: true, platform: true, accountName: true } },
            },
          },
        },
      });

      // If immediate or scheduled for past/now, push directly to queue worker
      if (!isFutureSchedule) {
        await enqueuePost(post.id);
      }

      res.status(201).json(post);
    } catch (err) {
      console.error('[PostController.create] Error:', err);
      res.status(500).json({ error: 'Failed to create post', details: String(err) });
    }
  },

  // POST /api/posts/ai-generate
  async generateAI(req: AuthRequest, res: Response): Promise<void> {
    const parsed = GenerateDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const content = await generateContent(parsed.data.prompt, parsed.data.tone);
      res.json({ content });
    } catch (err) {
      console.error('[PostController.generateAI] Error:', err);
      res.status(500).json({ error: 'Failed to generate AI content' });
    }
  },
};
