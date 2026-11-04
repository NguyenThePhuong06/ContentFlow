import './config.js';

import { app } from './app.js';
import { startWorker } from './workers/post.worker.js';
import { startScheduler } from './workers/scheduler.js';

const PORT = Number(process.env.PORT) || 4001;

app.listen(PORT, async () => {
  console.log(`🚀 ContentFlow API running on http://localhost:${PORT}`);

  try {
    await startWorker();
  } catch (err) {
    console.warn(`[Warning] RabbitMQ not reachable on startup, fallback to in-memory worker.`, err);
  }

  // Start the Lean background scheduler for scheduled posts
  startScheduler();
});
