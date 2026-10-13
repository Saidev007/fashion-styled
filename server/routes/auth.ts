import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { connectDatabase } from '../config/db.js';
import { type AuthenticatedRequest, AUTH_COOKIE, requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.email().max(254).transform((value) => value.toLowerCase().trim()), password: z.string().min(8).max(128) });
const loginSchema = z.object({ email: z.email().max(254).transform((value) => value.toLowerCase().trim()), password: z.string().min(8).max(128) });
const router = Router();
const attempts = new Map<string, { count: number; resetAt: number }>();
function authRateLimit(req: AuthenticatedRequest, res: import('express').Response, next: import('express').NextFunction) {
  const key = req.ip ?? 'unknown';
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
  else if (current.count >= 10) return res.status(429).json({ success: false, message: 'Too many authentication attempts. Try again later.' });
  else current.count += 1;
  return next();
}
function issueSession(user: { id: string; email: string }, res: import('express').Response) {
  const token = jwt.sign({ email: user.email }, env.JWT_SECRET, { subject: user.id, issuer: 'fashion-style-board-ai', algorithm: 'HS256', expiresIn: '7d' });
  res.cookie(AUTH_COOKIE, token, { httpOnly: true, signed: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });
}
async function ensureDatabase() {
  if (!await connectDatabase()) throw new Error('The database is not configured.');
}

router.post('/register', authRateLimit, async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Please check your registration details.', errors: parsed.error.flatten() });
  try {
    await ensureDatabase();
    const email = parsed.data.email;
    if (await User.exists({ email })) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({ name: parsed.data.name, email, passwordHash });
    issueSession({ id: user.id, email: user.email }, res);
    return res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { return next(error); }
});

router.post('/login', authRateLimit, async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Please provide a valid email and password.' });
  try {
    await ensureDatabase();
    const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
    issueSession({ id: user.id, email: user.email }, res);
    return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { return next(error); }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { httpOnly: true, signed: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  return res.json({ success: true });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await ensureDatabase();
    const user = await User.findById(req.user!.id).select('name email preferences createdAt');
    if (!user) return res.status(401).json({ success: false, message: 'Session is no longer valid.' });
    return res.json({ success: true, user });
  } catch (error) { return next(error); }
});

export default router;
