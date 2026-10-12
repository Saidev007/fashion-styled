import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import healthRoutes from './routes/health.js';
import wardrobeRoutes from './routes/wardrobe.js';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.APP_URL, credentials: true }));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.SESSION_SECRET));
app.get('/api/v1', (_req, res) => res.json({ success: true, service: 'fashion-style-board-ai', version: '0.2.0' }));
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/wardrobe', wardrobeRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  void connectDatabase().then(() => {
    app.listen(env.PORT, () => console.log(`Fashion Style Board AI API listening on port ${env.PORT}`));
  }).catch((error: unknown) => {
    console.error('API startup failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  });
}


export default app

