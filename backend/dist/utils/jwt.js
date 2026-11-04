"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DEV_USER = void 0;
exports.signToken = signToken;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../db.js");
const configuredSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' &&
    (!configuredSecret || configuredSecret.length < 32 || configuredSecret === 'super_secret_jwt_key_here')) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters in production');
}
const JWT_SECRET = configuredSecret || 'jwt-fallback-secret-for-dev';
exports.DEFAULT_DEV_USER = {
    userId: '00000000-0000-0000-0000-000000000001',
    email: 'admin@contentflow.io',
};
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        const verified = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof verified === 'string' ||
            typeof verified.userId !== 'string' ||
            typeof verified.email !== 'string') {
            throw new Error('Invalid token payload');
        }
        decoded = verified;
    }
    catch {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
    void db_js_1.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, status: true },
    }).then((user) => {
        if (!user) {
            res.status(401).json({ error: 'Unauthorized: Account not found' });
            return;
        }
        if (user.status === 'SUSPENDED') {
            res.status(403).json({ error: 'This account has been suspended' });
            return;
        }
        req.user = { userId: user.id, email: user.email, role: user.role };
        next();
    }).catch((error) => {
        console.error('[requireAuth] Failed to load account:', error);
        res.status(500).json({ error: 'Failed to authenticate request' });
    });
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Administrator access required' });
        return;
    }
    next();
}
