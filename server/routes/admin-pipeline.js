import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { stat, readFile } from 'fs/promises';
import { adminAuth } from '../middleware/admin-auth.js';
import express from 'express';
import { readJson } from '../lib/json-store.js';
import {
  readPipelineMeta,
  readRebuildRequest,
  createRebuildRequest,
  readEnrichmentRequest,
  createEnrichmentRequest,
  ENRICHMENT_TYPES,
  listJobs,
  readJob,
} from '../lib/pipeline-state.js';

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

// GET /api/admin/pipeline/rebuild-request
router.get('/rebuild-request', async (_req, res) => {
  const request = await readRebuildRequest(DATA_DIR);
  if (!request) return res.status(404).json({ error: 'no rebuild request' });
  res.json(request);
});

// POST /api/admin/pipeline/rebuild-request
router.post('/rebuild-request', express.json(), async (req, res) => {
  const { reason, requestedBy } = req.body ?? {};

  if (typeof reason !== 'string' || reason.trim().length === 0) {
    return res.status(400).json({ error: 'reason is required' });
  }
  if (reason.trim().length > 500) {
    return res.status(400).json({ error: 'reason must be 500 characters or fewer' });
  }
  if (typeof requestedBy !== 'string' || requestedBy.trim().length === 0) {
    return res.status(400).json({ error: 'requestedBy is required' });
  }

  const existing = await readRebuildRequest(DATA_DIR);
  if (existing && existing.status === 'requested') {
    return res.status(409).json({ error: 'a rebuild request is already pending' });
  }

  try {
    const entry = await createRebuildRequest(DATA_DIR, {
      reason: reason.trim(),
      requestedBy: requestedBy.trim(),
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('[rebuild-request] write failed:', err);
    res.status(500).json({ error: 'failed to write rebuild request' });
  }
});

// ── Job queue ─────────────────────────────────────────────────────────────────

const JOB_ID_RE = /^[a-zA-Z0-9_-]+$/;
const LOGS_SUBPATH = ['pipeline', 'logs'].join(path.sep);

// GET /api/admin/pipeline/jobs
router.get('/jobs', async (_req, res) => {
  const jobs = await listJobs(DATA_DIR);
  res.json(jobs);
});

// GET /api/admin/pipeline/jobs/:id
router.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  if (!JOB_ID_RE.test(id)) return res.status(400).json({ error: 'invalid job id' });
  const job = await readJob(DATA_DIR, id);
  if (!job) return res.status(404).json({ error: 'job not found' });
  res.json(job);
});

// GET /api/admin/pipeline/jobs/:id/log
router.get('/jobs/:id/log', async (req, res) => {
  const { id } = req.params;
  if (!JOB_ID_RE.test(id)) return res.status(400).json({ error: 'invalid job id' });
  const job = await readJob(DATA_DIR, id);
  if (!job) return res.status(404).json({ error: 'job not found' });
  if (!job.logFile) return res.status(404).json({ error: 'no log file for this job' });

  const logsDir = path.resolve(path.join(DATA_DIR, 'pipeline', 'logs'));
  const resolved = path.resolve(path.join(DATA_DIR, job.logFile));
  if (resolved !== logsDir && !resolved.startsWith(logsDir + path.sep)) {
    return res.status(400).json({ error: 'invalid log file path' });
  }

  try {
    const content = await readFile(resolved, 'utf-8');
    res.type('text/plain').send(content);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'log file not found on disk' });
    throw err;
  }
});

// ── Enrichment request ────────────────────────────────────────────────────────

// GET /api/admin/pipeline/enrichment-request
router.get('/enrichment-request', async (_req, res) => {
  const request = await readEnrichmentRequest(DATA_DIR);
  if (!request) return res.status(404).json({ error: 'no enrichment request' });
  res.json(request);
});

// POST /api/admin/pipeline/enrichment-request
router.post('/enrichment-request', express.json(), async (req, res) => {
  const { type, reason, requestedBy } = req.body ?? {};

  if (!ENRICHMENT_TYPES.includes(type)) {
    return res.status(400).json({
      error: `type must be one of: ${ENRICHMENT_TYPES.join(', ')}`,
    });
  }
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    return res.status(400).json({ error: 'reason is required' });
  }
  if (reason.trim().length > 500) {
    return res.status(400).json({ error: 'reason must be 500 characters or fewer' });
  }
  if (typeof requestedBy !== 'string' || requestedBy.trim().length === 0) {
    return res.status(400).json({ error: 'requestedBy is required' });
  }

  const existing = await readEnrichmentRequest(DATA_DIR);
  if (existing && existing.status === 'requested') {
    return res.status(409).json({ error: 'an enrichment request is already pending' });
  }

  try {
    const entry = await createEnrichmentRequest(DATA_DIR, {
      type,
      reason: reason.trim(),
      requestedBy: requestedBy.trim(),
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('[enrichment-request] write failed:', err);
    res.status(500).json({ error: 'failed to write enrichment request' });
  }
});

export default router;
