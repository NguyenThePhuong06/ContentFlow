import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-fallback-secret-for-dev';
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      req.user = DEFAULT_DEV_USER;
      return next();
    }
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
