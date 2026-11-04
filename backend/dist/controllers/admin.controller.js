"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(25),
});
const UserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED']),
});
exports.AdminController = {
    async summary(_req, res) {
        const [users, activeUsers, posts, byStatus, recentLogs] = await Promise.all([
            db_js_1.prisma.user.count(),
            db_js_1.prisma.user.count({ where: { status: 'ACTIVE' } }),
            db_js_1.prisma.post.count(),
            db_js_1.prisma.post.groupBy({ by: ['status'], _count: { _all: true } }),
            db_js_1.prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
        ]);
        res.json({
            users,
            activeUsers,
            suspendedUsers: users - activeUsers,
            posts,
            activityLast24Hours: recentLogs,
            postsByStatus: Object.fromEntries(byStatus.map((row) => [row.status, row._count._all])),
        });
    },
    async users(req, res) {
        const pagination = PaginationSchema.safeParse(req.query);
        if (!pagination.success) {
            res.status(400).json({ errors: pagination.error.flatten().fieldErrors });
            return;
        }
        const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 191) : '';
        const where = search ? { email: { contains: search } } : {};
        const { page, limit } = pagination.data;
        const [users, total] = await Promise.all([
            db_js_1.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    lastLoginAt: true,
                    _count: { select: { posts: true, channels: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db_js_1.prisma.user.count({ where }),
        ]);
        res.json({ users, page, limit, total });
    },
    async updateUserStatus(req, res) {
        const parsed = UserStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const { userId } = req.params;
        if (userId === req.user.userId && parsed.data.status === 'SUSPENDED') {
            res.status(400).json({ error: 'You cannot suspend your own account' });
            return;
        }
        try {
            const result = await db_js_1.prisma.$transaction(async (transaction) => {
                const target = await transaction.user.findUnique({
                    where: { id: userId },
                    select: { id: true, email: true, role: true, status: true },
                });
                if (!target)
                    return null;
                if (target.role === 'ADMIN' && target.status === 'ACTIVE' && parsed.data.status === 'SUSPENDED') {
                    const activeAdmins = await transaction.user.count({
                        where: { role: 'ADMIN', status: 'ACTIVE' },
                    });
                    if (activeAdmins <= 1)
                        throw new Error('LAST_ACTIVE_ADMIN');
                }
                const updated = await transaction.user.update({
                    where: { id: userId },
                    data: { status: parsed.data.status },
                    select: { id: true, email: true, role: true, status: true },
                });
                await transaction.auditLog.create({
                    data: {
                        actorId: req.user.userId,
                        actorEmail: req.user.email,
                        targetUserId: target.id,
                        action: 'admin.user_status_changed',
                        details: JSON.stringify({ from: target.status, to: parsed.data.status }),
                    },
                });
                return updated;
            });
            if (!result) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(result);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'LAST_ACTIVE_ADMIN') {
                res.status(400).json({ error: 'Cannot suspend the last active administrator' });
                return;
            }
            console.error('[AdminController.updateUserStatus] Error:', error);
            res.status(500).json({ error: 'Failed to update user status' });
        }
    },
    async logs(req, res) {
        const pagination = PaginationSchema.safeParse(req.query);
        if (!pagination.success) {
            res.status(400).json({ errors: pagination.error.flatten().fieldErrors });
            return;
        }
        const { page, limit } = pagination.data;
        const [logs, total] = await Promise.all([
            db_js_1.prisma.auditLog.findMany({
                select: {
                    id: true,
                    actorEmail: true,
                    action: true,
                    targetUserId: true,
                    details: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db_js_1.prisma.auditLog.count(),
        ]);
        res.json({ logs, page, limit, total });
    },
    async posts(req, res) {
        const pagination = PaginationSchema.safeParse(req.query);
        if (!pagination.success) {
            res.status(400).json({ errors: pagination.error.flatten().fieldErrors });
            return;
        }
        const { page, limit } = pagination.data;
        const [posts, total] = await Promise.all([
            db_js_1.prisma.post.findMany({
                include: {
                    user: { select: { id: true, email: true } },
                    targets: {
                        include: { channel: { select: { platform: true, accountName: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db_js_1.prisma.post.count(),
        ]);
        res.json({ posts, page, limit, total });
    },
};
