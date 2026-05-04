import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import express from 'express';
import supertest from 'supertest';
import { writeJson } from '../lib/json-store.js';
import { updatePipelineMeta, readPipelineMeta, readRebuildRequest } from '../lib/pipeline-state.js';

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

  it('no pending upload → ledger has default null fields', async () => {
    const res = await request
      .get('/api/admin/pipeline/status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.ledger !== undefined);
    assert.equal(res.body.ledger.lastStagedAt, null);
    assert.equal(res.body.ledger.lastStagedHash, null);
    assert.equal(res.body.ledger.lastBuildAt, null);
    assert.equal(res.body.ledger.lastDeployAt, null);
    assert.deepEqual(res.body.ledger.notes, []);
  });

  it('with pending upload meta → 200 with pendingUpload and buildNotice', async () => {
    const meta = {
      uploadedAt: '2026-05-04T12:00:00.000Z',
      recordCount: 1234,
      uploadedBy: 'admin',
      checksum: 'sha256:abc123',
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
    assert.equal(res.body.pendingUpload.checksum, meta.checksum);
    assert.equal(typeof res.body.buildNotice, 'string');
    assert.ok(res.body.buildNotice.length > 0);
    assert.deepEqual(res.body.warnings, []);
  });

  it('meta present but enriched file missing → fileSizeBytes is null', async () => {
    const res = await request
      .get('/api/admin/pipeline/status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.pendingUpload.fileSizeBytes, null);
  });

  it('pipeline meta written externally → status ledger reflects it', async () => {
    await updatePipelineMeta(tmpDir, {
      lastStagedAt: '2026-05-04T12:00:00.000Z',
      lastStagedHash: 'sha256:abc123',
    });

    const res = await request
      .get('/api/admin/pipeline/status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.ledger.lastStagedAt, '2026-05-04T12:00:00.000Z');
    assert.equal(res.body.ledger.lastStagedHash, 'sha256:abc123');
    assert.equal(res.body.ledger.lastBuildAt, null);
  });

  it('readPipelineMeta returns defaults when file absent', async () => {
    const freshDir = await mkdtemp(path.join(tmpdir(), 'pipeline-state-test-'));
    try {
      const meta = await readPipelineMeta(freshDir);
      assert.equal(meta.lastStagedAt, null);
      assert.equal(meta.lastBuildAt, null);
      assert.deepEqual(meta.notes, []);
    } finally {
      await rm(freshDir, { recursive: true, force: true });
    }
  });

  it('updatePipelineMeta merges patch without losing other fields', async () => {
    const freshDir = await mkdtemp(path.join(tmpdir(), 'pipeline-state-merge-'));
    try {
      await updatePipelineMeta(freshDir, { lastStagedAt: '2026-01-01T00:00:00.000Z' });
      await updatePipelineMeta(freshDir, { lastBuildAt: '2026-01-02T00:00:00.000Z' });
      const meta = await readPipelineMeta(freshDir);
      assert.equal(meta.lastStagedAt, '2026-01-01T00:00:00.000Z');
      assert.equal(meta.lastBuildAt, '2026-01-02T00:00:00.000Z');
      assert.equal(meta.lastDeployAt, null);
    } finally {
      await rm(freshDir, { recursive: true, force: true });
    }
  });
});

describe('GET /api/admin/pipeline/rebuild-request', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'rebuild-request-get-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request.get('/api/admin/pipeline/rebuild-request');
    assert.equal(res.status, 401);
  });

  it('no request file → 404', async () => {
    const res = await request
      .get('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 404);
  });
});

describe('POST /api/admin/pipeline/rebuild-request', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'rebuild-request-post-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request
      .post('/api/admin/pipeline/rebuild-request')
      .send({ reason: 'test', requestedBy: 'Robert' });
    assert.equal(res.status, 401);
  });

  it('missing reason → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ requestedBy: 'Robert' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('reason'));
  });

  it('empty reason → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ reason: '   ', requestedBy: 'Robert' });
    assert.equal(res.status, 400);
  });

  it('reason over 500 chars → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ reason: 'x'.repeat(501), requestedBy: 'Robert' });
    assert.equal(res.status, 400);
  });

  it('missing requestedBy → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ reason: 'staged enriched dataset ready' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('requestedBy'));
  });

  it('valid payload → 201 with entry shape', async () => {
    const res = await request
      .post('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ reason: 'staged enriched dataset ready', requestedBy: 'Robert' });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'requested');
    assert.equal(res.body.requestedBy, 'Robert');
    assert.equal(res.body.reason, 'staged enriched dataset ready');
    assert.ok(typeof res.body.requestedAt === 'string');
  });

  it('valid request is readable via GET', async () => {
    const get = await request
      .get('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(get.status, 200);
    assert.equal(get.body.status, 'requested');
    assert.equal(get.body.requestedBy, 'Robert');
  });

  it('request is written to rebuild-request.json', async () => {
    const req = await readRebuildRequest(tmpDir);
    assert.ok(req !== null);
    assert.equal(req.status, 'requested');
  });

  it('history entry is appended to rebuild-history.json', async () => {
    const { readJson } = await import('../lib/json-store.js');
    const history = await readJson(path.join(tmpDir, 'pipeline', 'rebuild-history.json'));
    assert.ok(Array.isArray(history));
    assert.ok(history.length >= 1);
    assert.equal(history.at(-1).status, 'requested');
    assert.equal(history.at(-1).requestedBy, 'Robert');
  });
});
