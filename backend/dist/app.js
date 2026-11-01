"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const post_controller_js_1 = require("./controllers/post.controller.js");
const jwt_js_1 = require("./utils/jwt.js");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Healthcheck
exports.app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Channels route
exports.app.get('/api/channels', jwt_js_1.requireAuth, post_controller_js_1.PostController.listChannels);
// Post routes
exports.app.get('/api/posts', jwt_js_1.requireAuth, post_controller_js_1.PostController.list);
exports.app.post('/api/posts', jwt_js_1.requireAuth, post_controller_js_1.PostController.create);
exports.app.post('/api/posts/ai-generate', jwt_js_1.requireAuth, post_controller_js_1.PostController.generateAI);
