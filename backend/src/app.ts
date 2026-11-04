import express from 'express';
import cors from 'cors';
import { AccountController } from './controllers/account.controller.js';
import { AdminController } from './controllers/admin.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { PostController } from './controllers/post.controller.js';
import { requireAdmin, requireAuth } from './utils/jwt.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);

app.get('/api/me', requireAuth, AccountController.profile);
app.put('/api/me/password', requireAuth, AccountController.changePassword);

// Channels route
app.get('/api/channels', requireAuth, PostController.listChannels);

// Post routes
app.get('/api/posts', requireAuth, PostController.list);
app.post('/api/posts', requireAuth, PostController.create);
app.post('/api/posts/ai-generate', requireAuth, PostController.generateAI);

app.use('/api/admin', requireAuth, requireAdmin);
app.get('/api/admin/summary', AdminController.summary);
app.get('/api/admin/users', AdminController.users);
app.patch('/api/admin/users/:userId/status', AdminController.updateUserStatus);
app.get('/api/admin/logs', AdminController.logs);
app.get('/api/admin/posts', AdminController.posts);
