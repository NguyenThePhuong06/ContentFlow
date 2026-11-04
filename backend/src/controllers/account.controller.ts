import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { AuthRequest } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const AccountController = {
  async profile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, email: true, role: true, status: true, createdAt: true, lastLoginAt: true },
      });
      if (!user) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error('[AccountController.profile] Error:', error);
      res.status(500).json({ error: 'Failed to load account profile' });
    }
  },

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const parsed = ChangePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      if (!user || !(await verifyPassword(parsed.data.currentPassword, user.password))) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { password: await hashPassword(parsed.data.newPassword) },
        }),
        prisma.auditLog.create({
          data: { actorId: user.id, actorEmail: user.email, action: 'account.password_changed' },
        }),
      ]);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('[AccountController.changePassword] Error:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  },
};
