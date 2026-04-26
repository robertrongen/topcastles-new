import { Router } from 'express';
import { adminAuth } from '../middleware/admin-auth.js';

const router = Router();

router.use(adminAuth);

// GET /api/admin/health
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', auth: 'admin' });
});

export default router;
