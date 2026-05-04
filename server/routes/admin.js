import express, { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readdir, readFile } from 'fs/promises';
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

// Matches backup filenames: <name>-YYYY-MM-DDTHH-MM-SS.json
const ISO_STAMP_RE = /^(.+)-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})$/;

function parseBackupFilename(f) {
  if (!f.endsWith('.json')) return null;
  const base = f.slice(0, -5);
  const m = base.match(ISO_STAMP_RE);
  if (!m) return null;
  const [, file, stamp] = m;
  // Convert colon-free time back to ISO for Date parsing
  const iso = stamp.replace(/(\d{2})-(\d{2})-(\d{2})$/, '$1:$2:$3') + 'Z';
  const ts = Date.parse(iso);
  if (!file || isNaN(ts)) return null;
  return { file, timestamp: ts, filename: f };
}

// GET /api/admin/backups
// Returns metadata for editorial backup files, newest-first.
router.get('/backups', async (_req, res) => {
  const backupsDir = path.join(DATA_DIR, 'editorial', 'backups');
  try {
    const files = await readdir(backupsDir);
    const entries = files
      .map(parseBackupFilename)
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp);
    res.json(entries);
  } catch (err) {
    if (err.code === 'ENOENT') return res.json([]);
    console.error('[admin/backups] readdir failed:', err);
    res.status(500).json({ error: 'Could not read backups directory' });
  }
});

const CASTLES_ENRICHED_PATH = path.join(__dirname, '../../new_app/src/assets/data/castles_enriched.json');
let _castlesCache = null;

async function loadCastles() {
  if (_castlesCache) return _castlesCache;
  const raw = await readFile(CASTLES_ENRICHED_PATH, 'utf8');
  const data = JSON.parse(raw);
  const sorted = [...data].sort((a, b) => b.score_visitors - a.score_visitors);
  const visitorRankMap = new Map(sorted.map((c, i) => [c.castle_code, i + 1]));
  _castlesCache = data.map(c => ({
    code: c.castle_code,
    name: c.castle_name,
    country: c.country,
    editorialRank: c.position,
    visitorRank: visitorRankMap.get(c.castle_code) ?? 9999,
  }));
  return _castlesCache;
}

// GET /api/admin/castles/lookup?q=<prefix>
// Returns up to 12 castles matching the query by code or name prefix.
router.get('/castles/lookup', async (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);
  try {
    const castles = await loadCastles();
    const results = castles
      .filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      .slice(0, 12);
    res.json(results);
  } catch (err) {
    console.error('[admin/castles/lookup] failed:', err);
    res.status(500).json({ error: 'lookup failed' });
  }
});

export default router;
