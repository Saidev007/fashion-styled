import { Router } from 'express';

import { env } from '../config/env.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'fashion-style-board-ai',
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;
