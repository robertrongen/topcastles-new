import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import express from 'express';
import supertest from 'supertest';
import { writeJson } from '../lib/json-store.js';

const TOKEN = 'test-pipeline-token';

async function buildApp(tmpDir) {
  process.env.DATA_DIR = tmpDir;
  process.env.ADMIN_TOKEN = TOKEN;
  // Fresh module import — DATA_DIR is resolved at module load time, so we use
  // a cache-busting query string to get a fresh module on each test suite.
  const url = `./admin-pipeline.js?t=${Date.now()}`;
  const { default: adminPipelineRoutes } = await import(url);

  const app = express();
  app.use('/api/admin/pipeline', adminPipelineRoutes);
  return supertest(app);
}

describe('GET /api/admin/pipeline/status', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'admin-pipeline-test-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request.get('/api/admin/pipeline/status');
    assert.equal(res.status, 401);
  });

  it('wrong token → 401', async () => {
    const res = await request
      .get('/api/admin/pipeline/status')
      .set('Authorization', 'Bearer wrong-token');
    assert.equal(res.status, 401);
  });

  it('no pending upload → 200 with null pendingUpload and warning', async () => {
    const res = await request
      .get('/api/admin/pipeline/status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.pendingUpload, null);
    assert.equal(res.body.buildNotice, null);
    assert.ok(Array.isArray(res.body.warnings));
    assert.ok(res.body.warnings.length > 0);
  });

  it('with pending upload meta → 200 with pendingUpload and buildNotice', async () => {
    const meta = {
      uploadedAt: '2026-05-04T12:00:00.000Z',
      recordCount: 1234,
      uploadedBy: 'admin',
    };
    await writeJson(path.join(tmpDir, 'pending', 'meta.json'), meta);

    const res = await request
      .get('/api/admin/pipeline/status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.pendingUpload !== null);
    assert.equal(res.body.pendingUpload.present, true);
    assert.equal(res.body.pendingUpload.uploadedAt, meta.uploadedAt);
    assert.equal(res.body.pendingUpload.recordCount, meta.recordCount);
    assert.equal(res.body.pendingUpload.uploadedBy, meta.uploadedBy);
    assert.equal(res.body.pendingUpload.checksum, null);
    assert.equal(typeof res.body.buildNotice, 'string');
    assert.ok(res.body.buildNotice.length > 0);
    assert.deepEqual(res.body.warnings, []);
  });

  it('meta present but enriched file missing → fileSizeBytes is null', async () => {
    // meta already written in previous test; enriched file not staged
    const res = await request
      .get('/api/admin/pipeline/status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.pendingUpload.fileSizeBytes, null);
  });
});
