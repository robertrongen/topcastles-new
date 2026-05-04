import express, { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { adminAuth } from '../middleware/admin-auth.js';
import { readCastleOverrides, writeCastleOverrides } from '../lib/pipeline-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const CASTLES_ENRICHED_PATH =
  process.env.CASTLES_ENRICHED_PATH ||
  path.join(__dirname, '../../new_app/src/assets/data/castles_enriched.json');

// Fields an admin may write into an override record.
const EDITABLE_FIELDS = new Set([
  'castle_name', 'country', 'latitude', 'longitude', 'place',
  'region', 'region_code', 'castle_type', 'castle_concept',
  'condition', 'era', 'founder', 'inception_year', 'description', 'website',
]);

const NUMERIC_FIELDS = new Set(['latitude', 'longitude', 'era', 'inception_year']);

// Required fields for a new castle draft (in addition to castle_code).
const NEW_CASTLE_REQUIRED = ['castle_name', 'country', 'place', 'latitude', 'longitude'];

// castle_code must be a lowercase slug: letters, digits, hyphens.
const CASTLE_CODE_RE = /^[a-z0-9][a-z0-9-]*$/;

// ── Enriched data cache ───────────────────────────────────────────────────────

let _enrichedCache = null;

async function loadEnrichedCastles() {
  if (_enrichedCache) return _enrichedCache;
  const raw = await readFile(CASTLES_ENRICHED_PATH, 'utf8');
  _enrichedCache = JSON.parse(raw);
  return _enrichedCache;
}

async function loadCastlesSummary() {
  const data = await loadEnrichedCastles();
  const sorted = [...data].sort((a, b) => b.score_visitors - a.score_visitors);
  const visitorRankMap = new Map(sorted.map((c, i) => [c.castle_code, i + 1]));
  return data.map(c => ({
    code: c.castle_code,
    name: c.castle_name,
    country: c.country,
    editorialRank: c.position,
    visitorRank: visitorRankMap.get(c.castle_code) ?? 9999,
  }));
}

// ── Field validation ──────────────────────────────────────────────────────────

function validateOverrideFields(body) {
  const fields = {};
  const errors = [];

  for (const [key, value] of Object.entries(body)) {
    if (!EDITABLE_FIELDS.has(key)) continue; // silently strip non-editable

    if (NUMERIC_FIELDS.has(key)) {
      if (value !== null && typeof value !== 'number') {
        errors.push(`${key} must be a number or null`);
        continue;
      }
    } else {
      if (typeof value !== 'string') {
        errors.push(`${key} must be a string`);
        continue;
      }
    }
    fields[key] = value;
  }

  return { fields, errors };
}

// ── Router ────────────────────────────────────────────────────────────────────

const router = Router();
router.use(adminAuth);
router.use(express.json());

// GET /api/admin/castles/lookup?q=<prefix>
// Must be registered before /:code to avoid lookup being caught as a code.
router.get('/lookup', async (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);
  try {
    const castles = await loadCastlesSummary();
    const results = castles
      .filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      .slice(0, 12);
    res.json(results);
  } catch (err) {
    console.error('[admin/castles/lookup] failed:', err);
    res.status(500).json({ error: 'lookup failed' });
  }
});

// GET /api/admin/castles
// Returns the full overrides map.
router.get('/', async (_req, res) => {
  try {
    const overrides = await readCastleOverrides(DATA_DIR);
    res.json(overrides);
  } catch (err) {
    console.error('[admin/castles] read failed:', err);
    res.status(500).json({ error: 'failed to read overrides' });
  }
});

// GET /api/admin/castles/:code
// Returns the enriched record (if present) and the current override (if any).
router.get('/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const [enrichedData, overrides] = await Promise.all([
      loadEnrichedCastles(),
      readCastleOverrides(DATA_DIR),
    ]);

    const enriched = enrichedData.find(c => c.castle_code === code) ?? null;
    const override = overrides[code] ?? null;

    if (!enriched && !override) {
      return res.status(404).json({ error: `castle_code '${code}' not found` });
    }

    res.json({ code, enriched, override });
  } catch (err) {
    console.error('[admin/castles/:code] failed:', err);
    res.status(500).json({ error: 'failed to load castle' });
  }
});

// PUT /api/admin/castles/:code
// Full-replaces the override record for an existing castle.
// The castle_code must exist in the enriched dataset.
router.put('/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const enrichedData = await loadEnrichedCastles();
    const exists = enrichedData.some(c => c.castle_code === code);
    if (!exists) {
      return res.status(404).json({
        error: `castle_code '${code}' not found in enriched dataset — use POST /api/admin/castles to add a new castle draft`,
      });
    }

    const { fields, errors } = validateOverrideFields(req.body ?? {});
    if (errors.length) return res.status(400).json({ errors });
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'no editable fields provided' });
    }

    const overrides = await readCastleOverrides(DATA_DIR);
    overrides[code] = fields;
    await writeCastleOverrides(DATA_DIR, overrides);

    res.json({ code, override: fields });
  } catch (err) {
    console.error('[admin/castles/:code PUT] failed:', err);
    res.status(500).json({ error: 'failed to save override' });
  }
});

// POST /api/admin/castles
// Creates a new castle draft. castle_code must not exist in enriched data.
router.post('/', async (req, res) => {
  const body = req.body ?? {};
  const code = body.castle_code;

  if (typeof code !== 'string' || !CASTLE_CODE_RE.test(code)) {
    return res.status(400).json({
      error: 'castle_code must be a lowercase slug (letters, digits, hyphens)',
    });
  }

  try {
    const [enrichedData, overrides] = await Promise.all([
      loadEnrichedCastles(),
      readCastleOverrides(DATA_DIR),
    ]);

    if (enrichedData.some(c => c.castle_code === code)) {
      return res.status(409).json({
        error: `castle_code '${code}' already exists in the enriched dataset — use PUT /api/admin/castles/${code} to override it`,
      });
    }
    if (overrides[code]) {
      return res.status(409).json({
        error: `castle_code '${code}' already has a draft override`,
      });
    }

    // Validate required fields
    for (const field of NEW_CASTLE_REQUIRED) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return res.status(400).json({ error: 'latitude and longitude must be numbers' });
    }

    const { fields, errors } = validateOverrideFields(body);
    if (errors.length) return res.status(400).json({ errors });

    // Ensure required fields survived the editable-field filter
    for (const field of NEW_CASTLE_REQUIRED) {
      if (fields[field] === undefined) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    overrides[code] = fields;
    await writeCastleOverrides(DATA_DIR, overrides);

    res.status(201).json({ code, override: fields });
  } catch (err) {
    console.error('[admin/castles POST] failed:', err);
    res.status(500).json({ error: 'failed to create castle draft' });
  }
});

export default router;
