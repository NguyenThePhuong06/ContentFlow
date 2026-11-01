import express from 'express';
import cors from 'cors';
import { AuthController } from './controllers/auth.controller.js';
import { PostController } from './controllers/post.controller.js';
import { requireAuth } from './utils/jwt.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);

// Channels route
app.get('/api/channels', requireAuth, PostController.listChannels);

// Post routes
app.get('/api/posts', requireAuth, PostController.list);
app.post('/api/posts', requireAuth, PostController.create);
app.post('/api/posts/ai-generate', requireAuth, PostController.generateAI);
