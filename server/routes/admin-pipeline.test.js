import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import express from 'express';
import supertest from 'supertest';
import { writeJson } from '../lib/json-store.js';
import {
  updatePipelineMeta,
  readPipelineMeta,
  readRebuildRequest,
  readEnrichmentRequest,
  writeJob,
  jobsDir,
} from '../lib/pipeline-state.js';

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

  it('duplicate request while active â†’ 409', async () => {
    const res = await request
      .post('/api/admin/pipeline/rebuild-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ reason: 'another rebuild', requestedBy: 'Robert' });
    assert.equal(res.status, 409);
    assert.ok(res.body.error.includes('pending'));
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

describe('GET /api/admin/pipeline/enrichment-request', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'enrichment-get-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request.get('/api/admin/pipeline/enrichment-request');
    assert.equal(res.status, 401);
  });

  it('no request file → 404', async () => {
    const res = await request
      .get('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 404);
  });
});

describe('POST /api/admin/pipeline/enrichment-request', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'enrichment-post-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .send({ type: 'wikidata', reason: 'test', requestedBy: 'Robert' });
    assert.equal(res.status, 401);
  });

  it('invalid type → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'invalid', reason: 'test', requestedBy: 'Robert' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('type'));
  });

  it('missing type → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ reason: 'test', requestedBy: 'Robert' });
    assert.equal(res.status, 400);
  });

  it('missing reason → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'wikidata', requestedBy: 'Robert' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('reason'));
  });

  it('empty reason → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'wikidata', reason: '  ', requestedBy: 'Robert' });
    assert.equal(res.status, 400);
  });

  it('reason over 500 chars → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'wikidata', reason: 'x'.repeat(501), requestedBy: 'Robert' });
    assert.equal(res.status, 400);
  });

  it('missing requestedBy → 400', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'wikidata', reason: 'refresh missing fields' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('requestedBy'));
  });

  it('valid payload (wikidata) → 201 with entry shape', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'wikidata', reason: 'refresh missing fields', requestedBy: 'Robert' });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'requested');
    assert.equal(res.body.type, 'wikidata');
    assert.equal(res.body.requestedBy, 'Robert');
    assert.equal(res.body.reason, 'refresh missing fields');
    assert.ok(typeof res.body.requestedAt === 'string');
  });

  it('valid request is readable via GET', async () => {
    const get = await request
      .get('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(get.status, 200);
    assert.equal(get.body.status, 'requested');
    assert.equal(get.body.type, 'wikidata');
  });

  it('duplicate request while active → 409', async () => {
    const res = await request
      .post('/api/admin/pipeline/enrichment-request')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'wikipedia', reason: 'another run', requestedBy: 'Robert' });
    assert.equal(res.status, 409);
    assert.ok(res.body.error.includes('pending'));
  });

  it('request is written to enrichment-request.json', async () => {
    const req = await readEnrichmentRequest(tmpDir);
    assert.ok(req !== null);
    assert.equal(req.status, 'requested');
    assert.equal(req.type, 'wikidata');
  });

  it('history entry is appended to enrichment-history.json', async () => {
    const { readJson } = await import('../lib/json-store.js');
    const history = await readJson(path.join(tmpDir, 'pipeline', 'enrichment-history.json'));
    assert.ok(Array.isArray(history));
    assert.ok(history.length >= 1);
    assert.equal(history.at(-1).status, 'requested');
    assert.equal(history.at(-1).type, 'wikidata');
  });

  it('all valid types are accepted', async () => {
    for (const type of ['wikipedia', 'wikidata', 'coordinates', 'full']) {
      // Use a fresh dir for each to avoid 409
      const freshDir = await mkdtemp(path.join(tmpdir(), `enrichment-type-${type}-`));
      try {
        process.env.DATA_DIR = freshDir;
        process.env.ADMIN_TOKEN = TOKEN;
        const url = `./admin-pipeline.js?t=${Date.now()}-${type}`;
        const { default: freshRoutes } = await import(url);
        const freshApp = express();
        freshApp.use('/api/admin/pipeline', freshRoutes);
        const freshReq = supertest(freshApp);

        const res = await freshReq
          .post('/api/admin/pipeline/enrichment-request')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send({ type, reason: 'test', requestedBy: 'Robert' });
        assert.equal(res.status, 201, `type=${type} should return 201, got ${res.status}: ${JSON.stringify(res.body)}`);
        assert.equal(res.body.type, type);
      } finally {
        await rm(freshDir, { recursive: true, force: true });
      }
    }
  });
});

// ── Job queue tests ───────────────────────────────────────────────────────────

const SAMPLE_JOB = {
  id: 'job-20260505T100000-abcd',
  type: 'rebuild',
  status: 'completed',
  requestedBy: 'Robert',
  reason: 'staged enriched dataset ready',
  createdAt: '2026-05-05T10:00:00.000Z',
  startedAt: '2026-05-05T10:00:00.000Z',
  completedAt: '2026-05-05T10:05:00.000Z',
  logFile: 'pipeline/logs/2026-05-05T10-00-00-rebuild.log',
  errorMessage: null,
};

const RUNNING_JOB = {
  id: 'job-20260505T110000-ef01',
  type: 'rebuild',
  status: 'running',
  requestedBy: 'Robert',
  reason: 'another run',
  createdAt: '2026-05-05T11:00:00.000Z',
  startedAt: '2026-05-05T11:00:00.000Z',
  completedAt: null,
  logFile: 'pipeline/logs/2026-05-05T11-00-00-rebuild.log',
  errorMessage: null,
};

describe('GET /api/admin/pipeline/jobs', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'jobs-list-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request.get('/api/admin/pipeline/jobs');
    assert.equal(res.status, 401);
  });

  it('no jobs directory → 200 with empty array', async () => {
    const res = await request
      .get('/api/admin/pipeline/jobs')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  it('returns jobs sorted newest first', async () => {
    await writeJob(tmpDir, SAMPLE_JOB);
    await writeJob(tmpDir, RUNNING_JOB);

    const res = await request
      .get('/api/admin/pipeline/jobs')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);
    // RUNNING_JOB has later createdAt — should be first
    assert.equal(res.body[0].id, RUNNING_JOB.id);
    assert.equal(res.body[1].id, SAMPLE_JOB.id);
  });
});

describe('GET /api/admin/pipeline/jobs/:id', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'jobs-get-'));
    request = await buildApp(tmpDir);
    await writeJob(tmpDir, SAMPLE_JOB);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request.get('/api/admin/pipeline/jobs/job-123');
    assert.equal(res.status, 401);
  });

  it('invalid id characters → 400', async () => {
    const res = await request
      .get('/api/admin/pipeline/jobs/../secret')
      .set('Authorization', `Bearer ${TOKEN}`);
    // express will normalise the path — test with a genuinely bad id via a crafted URL
    const res2 = await request
      .get('/api/admin/pipeline/jobs/bad%2Fid')
      .set('Authorization', `Bearer ${TOKEN}`);
    // Express may decode %2F as / and treat it as a nested route; either 400 or 404 is safe
    assert.ok(res2.status === 400 || res2.status === 404, `expected 400 or 404, got ${res2.status}`);
  });

  it('unknown id → 404', async () => {
    const res = await request
      .get('/api/admin/pipeline/jobs/job-does-not-exist')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 404);
  });

  it('known id → 200 with job shape', async () => {
    const res = await request
      .get(`/api/admin/pipeline/jobs/${SAMPLE_JOB.id}`)
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, SAMPLE_JOB.id);
    assert.equal(res.body.type, 'rebuild');
    assert.equal(res.body.status, 'completed');
    assert.equal(res.body.requestedBy, 'Robert');
  });
});

describe('GET /api/admin/pipeline/jobs/:id/log', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'jobs-log-'));
    request = await buildApp(tmpDir);

    // Write the log file on disk
    const { mkdir: mkdirAsync, writeFile } = await import('fs/promises');
    const logsDir = path.join(tmpDir, 'pipeline', 'logs');
    await mkdirAsync(logsDir, { recursive: true });
    await writeFile(
      path.join(logsDir, '2026-05-05T10-00-00-rebuild.log'),
      '[2026-05-05T10:00:00.000Z] === Rebuild consumer started ===\n[2026-05-05T10:05:00.000Z] === Rebuild consumer finished: completed ===\n',
      'utf-8'
    );

    // Write job record pointing to that log
    await writeJob(tmpDir, SAMPLE_JOB);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
  });

  it('missing token → 401', async () => {
    const res = await request.get(`/api/admin/pipeline/jobs/${SAMPLE_JOB.id}/log`);
    assert.equal(res.status, 401);
  });

  it('unknown job id → 404', async () => {
    const res = await request
      .get('/api/admin/pipeline/jobs/no-such-job/log')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 404);
  });

  it('job with no logFile → 404', async () => {
    const noLogJob = { ...SAMPLE_JOB, id: 'job-nolog', logFile: null };
    await writeJob(tmpDir, noLogJob);
    const res = await request
      .get('/api/admin/pipeline/jobs/job-nolog/log')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 404);
  });

  it('log file present → 200 text/plain with content', async () => {
    const res = await request
      .get(`/api/admin/pipeline/jobs/${SAMPLE_JOB.id}/log`)
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/plain'));
    assert.ok(res.text.includes('Rebuild consumer started'));
    assert.ok(res.text.includes('completed'));
  });

  it('path-traversal logFile is rejected with 400', async () => {
    const badJob = {
      ...SAMPLE_JOB,
      id: 'job-traversal',
      logFile: '../../../etc/passwd',
    };
    await writeJob(tmpDir, badJob);
    const res = await request
      .get('/api/admin/pipeline/jobs/job-traversal/log')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 400);
  });
});
