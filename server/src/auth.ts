import 'dotenv/config';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRequest = Request & { userId?: number };
const secret = process.env.JWT_SECRET;

export function issueToken(userId: number): string {
  if (!secret) throw new Error('Falta configurar JWT_SECRET');
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token || !secret) return res.status(401).json({ error: 'Inicia sesión para continuar' });
  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId < 1) throw new Error('Invalid user');
    req.userId = userId;
    return next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }
}
