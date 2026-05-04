import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { stat } from 'fs/promises';
import { adminAuth } from '../middleware/admin-auth.js';
import { readJson } from '../lib/json-store.js';
import { readPipelineMeta } from '../lib/pipeline-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const PENDING_ENRICHED = path.join(DATA_DIR, 'pending', 'castles_enriched.json');
const PENDING_META = path.join(DATA_DIR, 'pending', 'meta.json');

const BUILD_NOTICE =
  'A pending upload is staged. Run npm run data:regenerate && npm run build on a developer machine to bring it live.';

const router = Router();
router.use(adminAuth);

// GET /api/admin/pipeline/status
router.get('/status', async (_req, res) => {
  const [meta, ledger] = await Promise.all([
    readJson(PENDING_META),
    readPipelineMeta(DATA_DIR),
  ]);

  if (!meta) {
    return res.json({
      pendingUpload: null,
      buildNotice: null,
      warnings: ['No pending upload is staged.'],
      ledger,
    });
  }

  let fileSizeBytes = null;
  try {
    const s = await stat(PENDING_ENRICHED);
    fileSizeBytes = s.size;
  } catch {
    // file may not exist even when meta does; treat as unknown
  }

  res.json({
    pendingUpload: {
      present: true,
      uploadedAt: meta.uploadedAt ?? null,
      recordCount: meta.recordCount ?? null,
      uploadedBy: meta.uploadedBy ?? null,
      fileSizeBytes,
      checksum: meta.checksum ?? null,
    },
    buildNotice: BUILD_NOTICE,
    warnings: [],
    ledger,
  });
});

export default router;
