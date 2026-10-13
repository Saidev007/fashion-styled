import { Router } from 'express';
import { z } from 'zod';
import { connectDatabase } from '../config/db.js';
import { type AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { WardrobeItem } from '../models/WardrobeItem.js';

const itemSchema = z.object({ name: z.string().trim().min(2).max(120), category: z.string().trim().min(2).max(60), color: z.string().trim().min(2).max(60), image: z.url().max(2048).optional() });
const router = Router();
router.use(requireAuth);
async function ensureDatabase() {
  if (!await connectDatabase()) throw new Error('The database is not configured.');
}
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try { await ensureDatabase(); const items = await WardrobeItem.find({ owner: req.user!.id }).sort({ createdAt: -1 }).limit(100); return res.json({ success: true, items }); }
  catch (error) { return next(error); }
});
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Wardrobe item validation failed.', errors: parsed.error.flatten() });
  try { await ensureDatabase(); const item = await WardrobeItem.create({ ...parsed.data, owner: req.user!.id }); return res.status(201).json({ success: true, item }); }
  catch (error) { return next(error); }
});
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  const id = String(req.params.id);
  if (!/^[a-f\d]{24}$/i.test(id)) return res.status(400).json({ success: false, message: 'Invalid resource identifier.' });
  try {
    await ensureDatabase();
    const item = await WardrobeItem.findOneAndDelete({ _id: id, owner: req.user!.id });
    if (!item) return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
    return res.json({ success: true });
  } catch (error) { return next(error); }
});
export default router;
