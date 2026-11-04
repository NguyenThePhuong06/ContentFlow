"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const channel_service_js_1 = require("../services/channel.service.js");
const jwt_js_1 = require("../utils/jwt.js");
const password_js_1 = require("../utils/password.js");
const CredentialsSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email().max(191).transform((email) => email.toLowerCase()),
    password: zod_1.z.string().min(8).max(128),
});
exports.AuthController = {
    async register(req, res) {
        const parsed = CredentialsSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        try {
            const { email, password } = parsed.data;
            const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
            const role = configuredAdminEmail === email ? 'ADMIN' : 'USER';
            const user = await db_js_1.prisma.user.create({
                data: { email, password: await (0, password_js_1.hashPassword)(password), role },
                select: { id: true, email: true },
            });
            await (0, channel_service_js_1.ensureDefaultChannels)(user.id);
            await db_js_1.prisma.auditLog.create({
                data: {
                    actorId: user.id,
                    actorEmail: user.email,
                    action: 'auth.register',
                    details: JSON.stringify({ role }),
                },
            });
            res.status(201).json({
                token: (0, jwt_js_1.signToken)({ userId: user.id, email: user.email }),
                user: { ...user, role },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                res.status(409).json({ error: 'An account with this email already exists' });
                return;
            }
            console.error('[AuthController.register] Error:', error);
            res.status(500).json({ error: 'Failed to create account' });
        }
    },
    async login(req, res) {
        const parsed = CredentialsSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        try {
            const { email, password } = parsed.data;
            const user = await db_js_1.prisma.user.findUnique({ where: { email } });
            if (!user || !(await (0, password_js_1.verifyPassword)(password, user.password))) {
                await db_js_1.prisma.auditLog.create({
                    data: { actorEmail: email, action: 'auth.login_failed' },
                });
                res.status(401).json({ error: 'Email or password is incorrect' });
                return;
            }
            if (user.status === 'SUSPENDED') {
                await db_js_1.prisma.auditLog.create({
                    data: { actorId: user.id, actorEmail: user.email, action: 'auth.login_blocked' },
                });
                res.status(403).json({ error: 'This account has been suspended' });
                return;
            }
            await db_js_1.prisma.$transaction([
                db_js_1.prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                }),
                db_js_1.prisma.auditLog.create({
                    data: { actorId: user.id, actorEmail: user.email, action: 'auth.login' },
                }),
            ]);
            res.json({
                token: (0, jwt_js_1.signToken)({ userId: user.id, email: user.email }),
                user: { id: user.id, email: user.email, role: user.role },
            });
        }
        catch (error) {
            console.error('[AuthController.login] Error:', error);
            res.status(500).json({ error: 'Failed to sign in' });
        }
    },
};
