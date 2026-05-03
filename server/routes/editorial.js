import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJson } from '../lib/json-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_FILES = new Set([
  'countries',
  'regions',
  'castle-quotes',
  'period-picks',
  'browse-bands',
]);

const router = Router();

// GET /api/editorial/:file
// Public — no auth. Serves editorial overlay JSON from /data/editorial/.
// Returns {} for missing files; 404 for unknown names; 500 (logged) for read errors.
router.get('/:file', async (req, res) => {
  const name = req.params.file;

  if (!ALLOWED_FILES.has(name)) {
    return res.status(404).json({ error: 'Not found' });
  }

  const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
  const filePath = path.join(dataDir, 'editorial', `${name}.json`);

  let data;
  try {
    data = await readJson(filePath);
  } catch (err) {
    console.error(`[editorial] read error for ${name}:`, err);
    return res.status(500).json({ error: 'Server error' });
  }

  if (data === null) {
    return res.json({});
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    console.error(`[editorial] unexpected data shape for ${name}: expected plain object, got ${Array.isArray(data) ? 'array' : typeof data}`);
    return res.status(500).json({ error: 'Server error' });
  }

  res.json(data);
});

export default router;
