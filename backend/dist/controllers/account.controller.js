"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const password_js_1 = require("../utils/password.js");
const ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8).max(128),
});
exports.AccountController = {
    async profile(req, res) {
        try {
            const user = await db_js_1.prisma.user.findUnique({
                where: { id: req.user.userId },
                select: { id: true, email: true, role: true, status: true, createdAt: true, lastLoginAt: true },
            });
            if (!user) {
                res.status(404).json({ error: 'Account not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            console.error('[AccountController.profile] Error:', error);
            res.status(500).json({ error: 'Failed to load account profile' });
        }
    },
    async changePassword(req, res) {
        const parsed = ChangePasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        try {
            const user = await db_js_1.prisma.user.findUnique({ where: { id: req.user.userId } });
            if (!user || !(await (0, password_js_1.verifyPassword)(parsed.data.currentPassword, user.password))) {
                res.status(400).json({ error: 'Current password is incorrect' });
                return;
            }
            await db_js_1.prisma.$transaction([
                db_js_1.prisma.user.update({
                    where: { id: user.id },
                    data: { password: await (0, password_js_1.hashPassword)(parsed.data.newPassword) },
                }),
                db_js_1.prisma.auditLog.create({
                    data: { actorId: user.id, actorEmail: user.email, action: 'account.password_changed' },
                }),
            ]);
            res.json({ message: 'Password updated successfully' });
        }
        catch (error) {
            console.error('[AccountController.changePassword] Error:', error);
            res.status(500).json({ error: 'Failed to update password' });
        }
    },
};
