"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const account_controller_js_1 = require("./controllers/account.controller.js");
const admin_controller_js_1 = require("./controllers/admin.controller.js");
const auth_controller_js_1 = require("./controllers/auth.controller.js");
const post_controller_js_1 = require("./controllers/post.controller.js");
const jwt_js_1 = require("./utils/jwt.js");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Healthcheck
exports.app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.app.post('/api/auth/register', auth_controller_js_1.AuthController.register);
exports.app.post('/api/auth/login', auth_controller_js_1.AuthController.login);
exports.app.get('/api/me', jwt_js_1.requireAuth, account_controller_js_1.AccountController.profile);
exports.app.put('/api/me/password', jwt_js_1.requireAuth, account_controller_js_1.AccountController.changePassword);
// Channels route
exports.app.get('/api/channels', jwt_js_1.requireAuth, post_controller_js_1.PostController.listChannels);
// Post routes
exports.app.get('/api/posts', jwt_js_1.requireAuth, post_controller_js_1.PostController.list);
exports.app.post('/api/posts', jwt_js_1.requireAuth, post_controller_js_1.PostController.create);
exports.app.post('/api/posts/ai-generate', jwt_js_1.requireAuth, post_controller_js_1.PostController.generateAI);
exports.app.use('/api/admin', jwt_js_1.requireAuth, jwt_js_1.requireAdmin);
exports.app.get('/api/admin/summary', admin_controller_js_1.AdminController.summary);
exports.app.get('/api/admin/users', admin_controller_js_1.AdminController.users);
exports.app.patch('/api/admin/users/:userId/status', admin_controller_js_1.AdminController.updateUserStatus);
exports.app.get('/api/admin/logs', admin_controller_js_1.AdminController.logs);
exports.app.get('/api/admin/posts', admin_controller_js_1.AdminController.posts);
