"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DEV_USER = void 0;
exports.signToken = signToken;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-fallback-secret-for-dev';
exports.DEFAULT_DEV_USER = {
    userId: '00000000-0000-0000-0000-000000000001',
    email: 'admin@contentflow.io',
};
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    // If no auth token provided, fallback to default dev user in development mode
    if (!authHeader?.startsWith('Bearer ')) {
        if (process.env.NODE_ENV !== 'production') {
            req.user = exports.DEFAULT_DEV_USER;
            return next();
        }
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        if (process.env.NODE_ENV !== 'production') {
            req.user = exports.DEFAULT_DEV_USER;
            return next();
        }
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
