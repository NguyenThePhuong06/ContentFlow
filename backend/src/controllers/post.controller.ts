import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { AuthRequest } from '../utils/jwt.js';
import { enqueuePost } from '../workers/queue.js';
import { generateContent } from '../services/ai.service.js';
import { ensureDefaultChannels } from '../services/channel.service.js';

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

export const PostController = {
  // GET /api/channels
  async listChannels(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await ensureDefaultChannels(userId);

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
      const userId = req.user!.userId;
      await ensureDefaultChannels(userId);

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
      const userId = req.user!.userId;

      await ensureDefaultChannels(userId);
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

      await prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: req.user!.email,
          action: 'post.created',
          targetUserId: userId,
          details: JSON.stringify({ postId: post.id, channelCount: channelIds.length }),
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
