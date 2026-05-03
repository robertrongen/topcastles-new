import express, { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';
import { adminAuth } from '../middleware/admin-auth.js';
import { readJson, writeJson } from '../lib/json-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const PENDING_ENRICHED = path.join(DATA_DIR, 'pending', 'castles_enriched.json');
const PENDING_META = path.join(DATA_DIR, 'pending', 'meta.json');

const MIN_RECORD_COUNT = 500;

const router = Router();

router.use(adminAuth);

// GET /api/admin/health
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', auth: 'admin' });
});

// POST /api/admin/upload-enriched
// Stages a validated castles_enriched.json replacement to /data/pending/.
// The developer machine must then pull the pending file and run the normal
// pipeline + deploy to bring the content live.
router.post('/upload-enriched', express.json({ limit: '10mb' }), async (req, res) => {
  if (!req.is('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  const castles = req.body;

  if (!Array.isArray(castles)) {
    return res.status(400).json({ error: 'payload must be a JSON array' });
  }
  if (castles.length === 0) {
    return res.status(400).json({ error: 'payload array is empty' });
  }
  if (castles.length < MIN_RECORD_COUNT) {
    return res.status(400).json({
      error: `payload has only ${castles.length} records — expected ≥ ${MIN_RECORD_COUNT}; possible accidental subset upload`,
    });
  }

  const seenCodes = new Map();
  for (let i = 0; i < castles.length; i++) {
    const el = castles[i];

    if (typeof el.castle_code !== 'string' || el.castle_code.trim().length === 0) {
      return res.status(400).json({ error: `element at index ${i} missing castle_code` });
    }
    if (seenCodes.has(el.castle_code)) {
      return res.status(400).json({
        error: `duplicate castle_code: ${el.castle_code} at index ${i} (first seen at index ${seenCodes.get(el.castle_code)})`,
      });
    }
    seenCodes.set(el.castle_code, i);

    const validCoord = (v) => v === null || typeof v === 'number';
    if (!Object.prototype.hasOwnProperty.call(el, 'latitude') || !Object.prototype.hasOwnProperty.call(el, 'longitude')) {
      return res.status(400).json({ error: `element at index ${i} missing latitude/longitude` });
    }
    if (!validCoord(el.latitude) || !validCoord(el.longitude)) {
      return res.status(400).json({ error: `element at index ${i} has invalid latitude/longitude (must be number or null)` });
    }

    if (i > 0) {
      const prev = castles[i - 1];
      if ((el.score_total ?? 0) > (prev.score_total ?? 0)) {
        return res.status(400).json({
          error: `not sorted by score_total at index ${i} (${prev.castle_code} → ${el.castle_code})`,
        });
      }
    }
  }

  try {
    await writeJson(PENDING_ENRICHED, castles);
    const meta = {
      uploadedAt: new Date().toISOString(),
      recordCount: castles.length,
      uploadedBy: 'admin',
    };
    await writeJson(PENDING_META, meta);
    res.json({ recordCount: castles.length, uploadedAt: meta.uploadedAt });
  } catch (err) {
    console.error('[upload-enriched] write failed:', err);
    res.status(500).json({ error: 'failed to stage upload' });
  }
});

// GET /api/admin/pending-status
router.get('/pending-status', async (_req, res) => {
  const meta = await readJson(PENDING_META);
  if (!meta) {
    return res.status(404).json({ error: 'no pending upload' });
  }
  res.json(meta);
});

// GET /api/admin/backups
// Returns metadata for editorial backup files, newest-first.
router.get('/backups', async (_req, res) => {
  const backupsDir = path.join(DATA_DIR, 'editorial', 'backups');
  try {
    const files = await readdir(backupsDir);
    const entries = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const base = f.slice(0, -5); // strip .json
        const lastDash = base.lastIndexOf('-');
        if (lastDash === -1) return null;
        const file = base.slice(0, lastDash);
        const ts = parseInt(base.slice(lastDash + 1), 10);
        if (!file || isNaN(ts)) return null;
        return { file, timestamp: ts, filename: f };
      })
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp);
    res.json(entries);
  } catch (err) {
    if (err.code === 'ENOENT') return res.json([]);
    console.error('[admin/backups] readdir failed:', err);
    res.status(500).json({ error: 'Could not read backups directory' });
  }
});

export default router;
