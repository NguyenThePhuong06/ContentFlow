import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const configuredSecret = process.env.JWT_SECRET;
if (
  process.env.NODE_ENV === 'production' &&
  (!configuredSecret || configuredSecret.length < 32 || configuredSecret === 'super_secret_jwt_key_here')
) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters in production');
}

const JWT_SECRET = configuredSecret || 'jwt-fallback-secret-for-dev';
export const DEFAULT_DEV_USER = {
  userId: '00000000-0000-0000-0000-000000000001',
  email: 'admin@contentflow.io',
};

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // If no auth token provided, fallback to default dev user in development mode
  if (!authHeader?.startsWith('Bearer ')) {
    if (process.env.NODE_ENV !== 'production') {
      req.user = DEFAULT_DEV_USER;
      return next();
    }
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === 'string' ||
      typeof decoded.userId !== 'string' ||
      typeof decoded.email !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      req.user = DEFAULT_DEV_USER;
      return next();
    }
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
