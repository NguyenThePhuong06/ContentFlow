import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { signToken } from '../utils/jwt.js';

describe('Post API Integration Flow', () => {
  const token = signToken({ userId: 'test-user-123', email: 'dev@contentflow.io' });

  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/posts should reject unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/posts').send({ content: 'Test post' });
    expect(res.status).toBe(401);
  });

  it('POST /api/posts should validate payload using Zod and return 400 when channelIds missing', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Valid content, but missing channelIds' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('channelIds');
  });

  it('POST /api/posts/ai-generate should return drafted content', async () => {
    const res = await request(app)
      .post('/api/posts/ai-generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'Launch of ContentFlow platform', tone: 'professional' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(typeof res.body.content).toBe('string');
  });
});

