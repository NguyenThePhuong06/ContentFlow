import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const configuredSecret = process.env.JWT_SECRET;
if (
  process.env.NODE_ENV === 'production' &&
  (!configuredSecret || configuredSecret.length < 32 || configuredSecret === 'super_secret_jwt_key_here')
) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters in production');
}

const JWT_SECRET = configuredSecret || 'jwt-fallback-secret-for-dev';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  let userId: string;
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    if (
      typeof verified === 'string' ||
      typeof verified.userId !== 'string' ||
      typeof verified.email !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }
    userId = verified.userId;
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  void prisma.user.findUnique({
    where: { id: userId },
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
  }).catch((error: unknown) => {
    console.error('[requireAuth] Failed to load account:', error);
    res.status(500).json({ error: 'Failed to authenticate request' });
  });
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Administrator access required' });
    return;
  }
  next();
}
