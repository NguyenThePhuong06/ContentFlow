import { describe, it, expect, vi } from 'vitest';
import { PostController } from '../controllers/post.controller.js';
import { Response } from 'express';
import { AuthRequest } from '../utils/jwt.js';

describe('Post API Integration Flow', () => {
  it('generateAI should return drafted content when given a prompt', async () => {
    const req = {
      body: { prompt: 'Launch of ContentFlow platform', tone: 'professional' },
    } as AuthRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    await PostController.generateAI(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(responseData).toHaveProperty('content');
    expect(typeof responseData.content).toBe('string');
  });

  it('create should reject invalid payload with 400 when channelIds missing', async () => {
    const req = {
      body: { content: 'Valid content, but missing channelIds' },
    } as AuthRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    await PostController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(responseData.errors).toHaveProperty('channelIds');
  });
});
