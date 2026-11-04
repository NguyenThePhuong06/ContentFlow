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

export function signToken(payload: { userId: string; email: string; role?: 'USER' | 'ADMIN' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  let payload: { userId: string; email: string; role?: 'USER' | 'ADMIN' };

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    if (
      typeof verified === 'string' ||
      typeof verified.userId !== 'string' ||
      typeof verified.email !== 'string'
    ) {
      res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
      return;
    }
    payload = {
      userId: verified.userId,
      email: verified.email,
      role: (verified.role as 'USER' | 'ADMIN') || 'USER',
    };
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      // Account deleted or doesn't exist in current database: reject with 401 so frontend clears token
      res.status(401).json({ error: 'Unauthorized: Account not found' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'This account has been suspended' });
      return;
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    console.warn('[requireAuth] Database lookup warning, using verified token identity:', error);
    // Token is cryptographically signed and valid. Fall back to verified JWT payload instead of crashing with 500
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || 'USER',
    };
    next();
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Administrator access required' });
    return;
  }
  next();
}
