import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readdir } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import express from 'express';
import supertest from 'supertest';
import { writeJson, readJson } from '../lib/json-store.js';

const TOKEN = 'test-admin-token';

async function buildApp(tmpDir) {
  process.env.DATA_DIR = tmpDir;
  process.env.ADMIN_TOKEN = TOKEN;

  // Fresh import per test suite using cache-busting query param trick isn't
  // needed here because DATA_DIR is read per-request in admin-editorial.js.
  const { default: adminEditorialRoutes } = await import('./admin-editorial.js');
  const { default: adminRoutes } = await import('./admin.js');

  const app = express();
  app.use('/api/admin/editorial', adminEditorialRoutes);
  app.use('/api/admin', adminRoutes);
  return supertest(app);
}

describe('POST /api/admin/editorial/:file', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'admin-editorial-test-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request
      .post('/api/admin/editorial/countries')
      .set('Content-Type', 'application/json')
      .send({ FR: { editorialNote: 'x', definingTradition: 'y' } });
    assert.equal(res.status, 401);
  });

  it('wrong token → 401', async () => {
    const res = await request
      .post('/api/admin/editorial/countries')
      .set('Authorization', 'Bearer wrong-token')
      .set('Content-Type', 'application/json')
      .send({ FR: { editorialNote: 'x', definingTradition: 'y' } });
    assert.equal(res.status, 401);
  });

  it('unknown file → 404', async () => {
    const res = await request
      .post('/api/admin/editorial/secrets')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ x: {} });
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'unknown editorial file');
  });

  it('array payload → 400', async () => {
    const res = await request
      .post('/api/admin/editorial/countries')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send([{ editorialNote: 'x' }]);
    assert.equal(res.status, 400);
  });

  it('malformed castle-quotes payload → 400', async () => {
    const res = await request
      .post('/api/admin/editorial/castle-quotes')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ sy001: { quote: 'Great walls.', author: 'A' } }); // missing role and date
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors.some(e => e.keyPath === 'sy001.role'));
    assert.ok(res.body.errors.some(e => e.keyPath === 'sy001.date'));
  });

  it('malformed period-picks payload → 400', async () => {
    const res = await request
      .post('/api/admin/editorial/period-picks')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ '9th c.': { name: 'Something' } }); // missing code
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.keyPath === '9th c..code'), `expected code error, got: ${JSON.stringify(res.body.errors)}`);
  });

  it('malformed browse-bands payload → 400', async () => {
    const res = await request
      .post('/api/admin/editorial/browse-bands')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ '1-100': {} }); // missing note
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.keyPath === '1-100.note'));
  });

  it('valid first write → 200, no backup created', async () => {
    const payload = {
      FR: { editorialNote: 'The deepest catalogue.', definingTradition: 'Renaissance' },
    };
    const res = await request
      .post('/api/admin/editorial/countries')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.file, 'countries');
    assert.equal(res.body.keys, 1);
    assert.ok(res.body.timestamp);

    // No backup on first write
    const backupsDir = path.join(tmpDir, 'editorial', 'backups');
    const files = await readdir(backupsDir).catch(() => []);
    const countryBackups = files.filter(f => f.startsWith('countries-'));
    assert.equal(countryBackups.length, 0);

    // File was written
    const written = await readJson(path.join(tmpDir, 'editorial', 'countries.json'));
    assert.deepEqual(written, payload);
  });

  it('second write → 200, backup created with previous contents', async () => {
    const first = await readJson(path.join(tmpDir, 'editorial', 'countries.json'));

    const payload = {
      FR: { editorialNote: 'Updated note.', definingTradition: 'Gothic' },
      DE: { editorialNote: 'German castles.', definingTradition: 'Romanesque' },
    };
    const res = await request
      .post('/api/admin/editorial/countries')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.equal(res.status, 200);
    assert.equal(res.body.keys, 2);

    // Backup was created
    const backupsDir = path.join(tmpDir, 'editorial', 'backups');
    const files = await readdir(backupsDir);
    const countryBackups = files.filter(f => f.startsWith('countries-') && f.endsWith('.json'));
    assert.equal(countryBackups.length, 1);

    // Backup content equals the previous file contents
    const backupData = await readJson(path.join(backupsDir, countryBackups[0]));
    assert.deepEqual(backupData, first);
  });

  it('GET /api/admin/backups sees the created backup and sorts newest first', async () => {
    const res = await request
      .get('/api/admin/backups')
      .set('Authorization', `Bearer ${TOKEN}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 1, `expected ≥1 backup, got ${res.body.length}`);

    // Sorted newest first
    for (let i = 1; i < res.body.length; i++) {
      assert.ok(
        res.body[i - 1].timestamp >= res.body[i].timestamp,
        'backups not sorted newest-first',
      );
    }

    // Each entry has expected fields
    const entry = res.body[0];
    assert.ok(entry.file, 'missing file field');
    assert.ok(entry.filename, 'missing filename field');
    assert.ok(typeof entry.timestamp === 'number', 'timestamp must be a number');
    assert.ok(entry.filename.endsWith('.json'), 'filename must end in .json');
  });

  it('second write returns backupFilename in response', async () => {
    const payload = { FR: { note: 'Another update.' } };
    const res = await request
      .post('/api/admin/editorial/countries')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send(payload);
    assert.equal(res.status, 200);
    assert.ok(res.body.backupFilename, 'backupFilename should be present on second write');
    assert.ok(res.body.backupFilename.startsWith('countries-'), 'backupFilename should start with file name');
  });

  it('PUT /api/admin/editorial/:file also works', async () => {
    const payload = { ES: { note: 'Castles of Spain.' } };
    const res = await request
      .put('/api/admin/editorial/countries')
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json')
      .send(payload);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.file, 'countries');
  });

  it('PUT without bearer → 401', async () => {
    const res = await request
      .put('/api/admin/editorial/countries')
      .set('Content-Type', 'application/json')
      .send({ ES: { note: 'test' } });
    assert.equal(res.status, 401);
  });
});
