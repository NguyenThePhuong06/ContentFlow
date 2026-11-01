"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const post_controller_js_1 = require("../controllers/post.controller.js");
(0, vitest_1.describe)('Post API Integration Flow', () => {
    (0, vitest_1.it)('generateAI should return drafted content when given a prompt', async () => {
        const req = {
            body: { prompt: 'Launch of ContentFlow platform', tone: 'professional' },
        };
        const res = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
        };
        await post_controller_js_1.PostController.generateAI(req, res);
        (0, vitest_1.expect)(res.json).toHaveBeenCalled();
        const responseData = res.json.mock.calls[0][0];
        (0, vitest_1.expect)(responseData).toHaveProperty('content');
        (0, vitest_1.expect)(typeof responseData.content).toBe('string');
    });
    (0, vitest_1.it)('create should reject invalid payload with 400 when channelIds missing', async () => {
        const req = {
            body: { content: 'Valid content, but missing channelIds' },
        };
        const res = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
        };
        await post_controller_js_1.PostController.create(req, res);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(res.json).toHaveBeenCalled();
        const responseData = res.json.mock.calls[0][0];
        (0, vitest_1.expect)(responseData.errors).toHaveProperty('channelIds');
    });
});
