import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { startWorker } from './workers/post.worker.js';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, async () => {
  console.log(`🚀 ContentFlow API running on http://localhost:${PORT}`);

  try {
    await startWorker();
  } catch (err) {
    console.warn(`[Warning] RabbitMQ not reachable on startup, worker idle.`, err);
  }
});

