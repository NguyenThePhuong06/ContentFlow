"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./config.js");
const app_js_1 = require("./app.js");
const post_worker_js_1 = require("./workers/post.worker.js");
const scheduler_js_1 = require("./workers/scheduler.js");
const PORT = Number(process.env.PORT) || 4000;
app_js_1.app.listen(PORT, async () => {
    console.log(`🚀 ContentFlow API running on http://localhost:${PORT}`);
    try {
        await (0, post_worker_js_1.startWorker)();
    }
    catch (err) {
        console.warn(`[Warning] RabbitMQ not reachable on startup, fallback to in-memory worker.`, err);
    }
    // Start the Lean background scheduler for scheduled posts
    (0, scheduler_js_1.startScheduler)();
});
