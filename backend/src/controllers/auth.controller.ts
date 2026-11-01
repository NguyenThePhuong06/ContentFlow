import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const CredentialsSchema = z.object({
  email: z.string().trim().email().max(191).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    const parsed = CredentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const { email, password } = parsed.data;
      const user = await prisma.user.create({
        data: { email, password: await hashPassword(password) },
        select: { id: true, email: true },
      });

      res.status(201).json({
        token: signToken({ userId: user.id, email: user.email }),
        user,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
      }
      console.error('[AuthController.register] Error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const parsed = CredentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await verifyPassword(password, user.password))) {
        res.status(401).json({ error: 'Email or password is incorrect' });
        return;
      }

      res.json({
        token: signToken({ userId: user.id, email: user.email }),
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error('[AuthController.login] Error:', error);
      res.status(500).json({ error: 'Failed to sign in' });
    }
  },
};
