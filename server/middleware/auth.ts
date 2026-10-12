import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'fashion_session';
export type AuthenticatedRequest = Request & { user?: { id: string; email: string } };

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = req.signedCookies?.[AUTH_COOKIE] ?? (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token || typeof token !== 'string') return res.status(401).json({ success: false, message: 'Authentication required.' });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'fashion-style-board-ai' });
    if (typeof payload === 'string' || typeof payload.sub !== 'string' || typeof payload.email !== 'string') throw new Error('Invalid token');
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
}
