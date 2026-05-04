import express, { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir, readFile, readdir } from 'fs/promises';
import { adminAuth } from '../middleware/admin-auth.js';
import { readJson, writeJson } from '../lib/json-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CASTLES_PATH = path.join(__dirname, '../../new_app/src/assets/data/castles_enriched.json');
let _castleCodesCache = null;

async function getCastleCodes() {
  if (_castleCodesCache) return _castleCodesCache;
  try {
    const raw = await readFile(CASTLES_PATH, 'utf8');
    const data = JSON.parse(raw);
    _castleCodesCache = new Set(data.map(c => c.castle_code));
  } catch {
    _castleCodesCache = new Set();
  }
  return _castleCodesCache;
}

export const EDITORIAL_FILES = new Set([
  'countries',
  'regions',
  'castle-quotes',
  'period-picks',
  'browse-bands',
]);

function editorialDir(dataDir) {
  return path.join(dataDir, 'editorial');
}

function backupStamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}-${pad(now.getUTCMinutes())}-${pad(now.getUTCSeconds())}`
  );
}

async function validatePayload(file, data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return [{ keyPath: '.', message: 'payload must be a plain object' }];
  }

  const errors = [];
  let castleCodes = null;
  if (file === 'countries' || file === 'castle-quotes' || file === 'period-picks') {
    castleCodes = await getCastleCodes();
  }

  for (const [key, val] of Object.entries(data)) {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      errors.push({ keyPath: key, message: 'value must be an object' });
      continue;
    }

    if (file === 'countries') {
      if (val.topEntryCode && castleCodes && !castleCodes.has(val.topEntryCode)) {
        errors.push({ keyPath: `${key}.topEntryCode`, message: `castle code '${val.topEntryCode}' not found in index` });
      }
    } else if (file === 'castle-quotes') {
      for (const field of ['quote', 'author', 'role', 'date']) {
        if (typeof val[field] !== 'string' || val[field].length === 0) {
          errors.push({ keyPath: `${key}.${field}`, message: `${field} is required` });
        }
      }
      if (val.castle && castleCodes && !castleCodes.has(val.castle)) {
        errors.push({ keyPath: `${key}.castle`, message: `castle code '${val.castle}' not found in index` });
      }
    } else if (file === 'period-picks') {
      if (typeof val.code !== 'string' || val.code.length === 0) {
        errors.push({ keyPath: `${key}.code`, message: 'code is required' });
      } else if (castleCodes && !castleCodes.has(val.code)) {
        errors.push({ keyPath: `${key}.code`, message: `castle code '${val.code}' not found in index` });
      }
      if (typeof val.name !== 'string' || val.name.length === 0) {
        errors.push({ keyPath: `${key}.name`, message: 'name is required' });
      }
    } else if (file === 'browse-bands') {
      if (typeof val.note !== 'string' || val.note.length === 0) {
        errors.push({ keyPath: `${key}.note`, message: 'note is required' });
      }
    }
    // regions: values must be objects (already checked above)
  }

  return errors;
}

// Matches backup filenames: <name>-YYYY-MM-DDTHH-MM-SS.json
const BACKUP_STAMP_RE = /^.+-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})\.json$/;

async function newestBackupMs(backupsDir) {
  const files = await readdir(backupsDir);
  let newest = null;
  for (const f of files) {
    const m = f.match(BACKUP_STAMP_RE);
    if (!m) continue;
    const iso = m[1].replace(/(\d{2})-(\d{2})-(\d{2})$/, '$1:$2:$3') + 'Z';
    const ts = Date.parse(iso);
    if (!isNaN(ts) && (newest === null || ts > newest)) newest = ts;
  }
  return newest;
}

const router = Router();

router.use(adminAuth);
router.use(express.json({ limit: '256kb' }));

async function handleWrite(req, res) {
  const name = req.params.file;

  if (!EDITORIAL_FILES.has(name)) {
    return res.status(404).json({ error: 'unknown editorial file' });
  }

  if (!req.is('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  const data = req.body;

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return res.status(400).json({ error: 'payload must be a plain object' });
  }

  const errors = await validatePayload(name, data);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
  const dir = editorialDir(dataDir);
  const filePath = path.join(dir, `${name}.json`);
  const backupsDir = path.join(dir, 'backups');

  let backupFilename = null;

  try {
    const existing = await readJson(filePath);
    if (existing !== null) {
      await mkdir(backupsDir, { recursive: true });
      backupFilename = `${name}-${backupStamp()}.json`;
      await writeJson(path.join(backupsDir, backupFilename), existing);
    }

    await writeJson(filePath, data);

    return res.json({
      success: true,
      file: name,
      keys: Object.keys(data).length,
      backupFilename,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[admin/editorial] write failed for ${name}:`, err);
    return res.status(500).json({ error: 'write failed' });
  }
}

// GET /api/admin/editorial/publish-status
// Returns the publish state: lastEditAt (newest backup), lastBuildAt (BUILD_TIMESTAMP env),
// needsRebuild flag, and deployCommand for operator clipboard copy.
router.get('/publish-status', async (_req, res) => {
  const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
  const backupsDir = path.join(dataDir, 'editorial', 'backups');

  let lastEditAt = null;
  try {
    const ts = await newestBackupMs(backupsDir);
    if (ts !== null) lastEditAt = new Date(ts).toISOString();
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('[admin/editorial/publish-status] backups scan failed:', err);
    }
  }

  const lastBuildAt = process.env.BUILD_TIMESTAMP || null;

  let needsRebuild = false;
  if (lastEditAt && !lastBuildAt) needsRebuild = true;
  else if (lastEditAt && lastBuildAt) needsRebuild = lastEditAt > lastBuildAt;

  const deployCommand = process.env.ADMIN_DEPLOY_COMMAND || './deploy.sh';

  res.json({ lastBuildAt, lastEditAt, needsRebuild, deployCommand });
});

// POST and PUT /api/admin/editorial/:file — whole-file replace
router.post('/:file', handleWrite);
router.put('/:file', handleWrite);

export default router;
