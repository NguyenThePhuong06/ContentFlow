import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { AuthRequest } from '../utils/jwt.js';
import { enqueuePost } from '../workers/queue.js';
import { generateContent } from '../services/ai.service.js';

const CreatePostSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  channelIds: z.array(z.string()).min(1, 'Select at least one channel'),
  scheduledAt: z.string().datetime().optional(),
});

const GenerateDraftSchema = z.object({
  prompt: z.string().min(3),
  tone: z.string().optional(),
});

export const PostController = {
  // GET /api/posts
  async list(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const posts = await prisma.post.findMany({
      where: { userId },
      include: { targets: { include: { channel: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  },

  // POST /api/posts
  async create(req: AuthRequest, res: Response): Promise<void> {
    const parsed = CreatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { content, channelIds, scheduledAt } = parsed.data;
    const userId = req.user?.userId || 'default-user-id';

    const post = await prisma.post.create({
      data: {
        userId,
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'SCHEDULED' : 'SCHEDULED',
        targets: {
          create: channelIds.map((channelId) => ({
            channelId,
            status: 'SCHEDULED',
          })),
        },
      },
    });

    // If not scheduled for future, push directly to RabbitMQ worker
    if (!scheduledAt) {
      await enqueuePost(post.id);
    }

    res.status(201).json(post);
  },

  // POST /api/posts/ai-generate
  async generateAI(req: AuthRequest, res: Response): Promise<void> {
    const parsed = GenerateDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const content = await generateContent(parsed.data.prompt, parsed.data.tone);
    res.json({ content });
  },
};

