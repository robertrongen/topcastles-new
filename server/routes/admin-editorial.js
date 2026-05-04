import express, { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';
import { adminAuth } from '../middleware/admin-auth.js';
import { readJson, writeJson } from '../lib/json-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

function validatePayload(file, data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return [{ keyPath: '.', message: 'payload must be a plain object' }];
  }

  const errors = [];

  for (const [key, val] of Object.entries(data)) {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      errors.push({ keyPath: key, message: 'value must be an object' });
      continue;
    }

    if (file === 'castle-quotes') {
      for (const field of ['quote', 'author', 'role', 'date']) {
        if (typeof val[field] !== 'string' || val[field].length === 0) {
          errors.push({ keyPath: `${key}.${field}`, message: `${field} is required` });
        }
      }
    } else if (file === 'period-picks') {
      if (typeof val.pick !== 'string' || val.pick.length === 0) {
        errors.push({ keyPath: `${key}.pick`, message: 'pick is required' });
      }
      if (typeof val.castleCode !== 'string' || val.castleCode.length === 0) {
        errors.push({ keyPath: `${key}.castleCode`, message: 'castleCode is required' });
      }
    } else if (file === 'browse-bands') {
      if (typeof val.note !== 'string' || val.note.length === 0) {
        errors.push({ keyPath: `${key}.note`, message: 'note is required' });
      }
    }
    // countries and regions: values must be objects (already checked above)
  }

  return errors;
}

const router = Router();

router.use(adminAuth);
router.use(express.json({ limit: '256kb' }));

// POST /api/admin/editorial/:file
router.post('/:file', async (req, res) => {
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

  const errors = validatePayload(name, data);
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
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[admin/editorial] write failed for ${name}:`, err);
    return res.status(500).json({ error: 'write failed' });
  }
});

export default router;
