import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import express from 'express';
import supertest from 'supertest';
import { writeJson } from '../lib/json-store.js';

const TOKEN = 'test-admin-token-pub';

async function buildApp(tmpDir) {
  process.env.DATA_DIR = tmpDir;
  process.env.ADMIN_TOKEN = TOKEN;
  delete process.env.BUILD_TIMESTAMP;
  delete process.env.ADMIN_DEPLOY_COMMAND;

  const { default: adminEditorialRoutes } = await import('./admin-editorial.js');
  const app = express();
  app.use('/api/admin/editorial', adminEditorialRoutes);
  return supertest(app);
}

async function writeBackup(tmpDir, filename, content = {}) {
  const backupsDir = path.join(tmpDir, 'editorial', 'backups');
  await mkdir(backupsDir, { recursive: true });
  await writeJson(path.join(backupsDir, filename), content);
}

describe('GET /api/admin/editorial/publish-status', () => {
  let tmpDir;
  let request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'admin-publish-test-'));
    request = await buildApp(tmpDir);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
    delete process.env.BUILD_TIMESTAMP;
    delete process.env.ADMIN_DEPLOY_COMMAND;
  });

  it('missing token → 401', async () => {
    const res = await request.get('/api/admin/editorial/publish-status');
    assert.equal(res.status, 401);
  });

  it('no backups → needsRebuild false, lastEditAt null', async () => {
    const res = await request
      .get('/api/admin/editorial/publish-status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.lastEditAt, null);
    assert.equal(res.body.needsRebuild, false);
  });

  it('response has expected shape', async () => {
    const res = await request
      .get('/api/admin/editorial/publish-status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.ok('lastBuildAt' in res.body, 'missing lastBuildAt');
    assert.ok('lastEditAt' in res.body, 'missing lastEditAt');
    assert.ok('needsRebuild' in res.body, 'missing needsRebuild');
    assert.ok('deployCommand' in res.body, 'missing deployCommand');
    assert.equal(typeof res.body.deployCommand, 'string');
    assert.ok(res.body.deployCommand.length > 0, 'deployCommand must be non-empty');
  });

  it('no BUILD_TIMESTAMP → lastBuildAt null, deployCommand is fallback', async () => {
    const res = await request
      .get('/api/admin/editorial/publish-status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.body.lastBuildAt, null);
    assert.equal(res.body.deployCommand, './deploy.sh');
  });

  it('backup exists, no BUILD_TIMESTAMP → needsRebuild true', async () => {
    await writeBackup(tmpDir, 'countries-2026-05-04T10-00-00.json', { FR: {} });

    const res = await request
      .get('/api/admin/editorial/publish-status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.lastEditAt, 'lastEditAt should be set when backups exist');
    assert.equal(res.body.lastBuildAt, null);
    assert.equal(res.body.needsRebuild, true);
  });

  it('backup exists, BUILD_TIMESTAMP older than edit → needsRebuild true', async () => {
    process.env.BUILD_TIMESTAMP = '2026-05-01T00:00:00.000Z';

    const res = await request
      .get('/api/admin/editorial/publish-status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.needsRebuild, true);

    delete process.env.BUILD_TIMESTAMP;
  });

  it('BUILD_TIMESTAMP newer than last edit → needsRebuild false', async () => {
    process.env.BUILD_TIMESTAMP = '2026-05-10T00:00:00.000Z';

    const res = await request
      .get('/api/admin/editorial/publish-status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.needsRebuild, false);

    delete process.env.BUILD_TIMESTAMP;
  });

  it('ADMIN_DEPLOY_COMMAND is returned verbatim', async () => {
    process.env.ADMIN_DEPLOY_COMMAND = 'bash custom-deploy.sh --env prod';

    const res = await request
      .get('/api/admin/editorial/publish-status')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.deployCommand, 'bash custom-deploy.sh --env prod');

    delete process.env.ADMIN_DEPLOY_COMMAND;
  });
});
