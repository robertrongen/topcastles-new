import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import express from 'express';
import supertest from 'supertest';
import { writeJson } from '../lib/json-store.js';

// DATA_DIR is read per-request in editorial.js, so setting it before
// importing works correctly with node:test's module caching.
let tmpDir;
let request;

describe('GET /api/editorial/:file', () => {
  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'editorial-test-'));
    process.env.DATA_DIR = tmpDir;

    // Import after DATA_DIR is set so the per-request lookup picks up tmpDir.
    const { default: editorialRoutes } = await import('./editorial.js');
    const app = express();
    app.use('/api/editorial', editorialRoutes);
    request = supertest(app);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
  });

  it('returns 404 for an unknown file name', async () => {
    const res = await request.get('/api/editorial/unknown');
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { error: 'Not found' });
  });

  it('returns 404 for a path-traversal attempt', async () => {
    const res = await request.get('/api/editorial/../../etc/passwd');
    // Express router won't even match this with a 404 from our handler;
    // it will 404 from the SPA fallback — either way it must not be 200.
    assert.ok(res.status !== 200, `expected non-200, got ${res.status}`);
  });

  it('returns {} with 200 for a known file that does not exist', async () => {
    const res = await request.get('/api/editorial/countries');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {});
  });

  it('returns the file contents when the file exists', async () => {
    const data = {
      FR: { editorialNote: 'The deepest catalogue.', definingTradition: 'Renaissance · concentric', topEntry: 'fr001', editorSleeper: false },
    };
    await writeJson(path.join(tmpDir, 'editorial', 'countries.json'), data);

    const res = await request.get('/api/editorial/countries');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, data);
  });

  it('response is a plain object, not an array or string', async () => {
    const res = await request.get('/api/editorial/countries');
    assert.equal(typeof res.body, 'object');
    assert.ok(!Array.isArray(res.body));
  });

  it('returns 500 when the file contains an array', async () => {
    // Write a file with invalid shape (array instead of object)
    await writeJson(path.join(tmpDir, 'editorial', 'regions.json'), [{ bad: true }]);
    const res = await request.get('/api/editorial/regions');
    assert.equal(res.status, 500);
    assert.deepEqual(res.body, { error: 'Server error' });
    // Restore to valid state so subsequent whitelist tests pass
    await writeJson(path.join(tmpDir, 'editorial', 'regions.json'), {});
  });

  // Verify every whitelisted name is accepted
  for (const name of ['countries', 'regions', 'castle-quotes', 'period-picks', 'browse-bands']) {
    it(`accepts whitelisted name "${name}" and returns 200`, async () => {
      const res = await request.get(`/api/editorial/${name}`);
      assert.equal(res.status, 200);
    });
  }
});
