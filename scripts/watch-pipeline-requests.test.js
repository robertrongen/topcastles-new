#!/usr/bin/env node
/**
 * Tests for watch-pipeline-requests.js.
 * Uses --once flag so each run polls exactly once and exits.
 * Uses --dry-run to avoid spawning real consumer scripts.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, 'watch-pipeline-requests.js');

function run(dataDir, extraArgs = []) {
  return spawnSync(process.execPath, [SCRIPT, '--once', ...extraArgs], {
    env: { ...process.env, DATA_DIR: dataDir },
    encoding: 'utf-8',
    timeout: 10_000,
  });
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

describe('watch-pipeline-requests.js — idle behaviour', () => {
  let tmpDir;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'watcher-idle-'));
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('exits 0 with no pipeline directory', () => {
    const result = run(tmpDir);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('No pending requests'), result.stdout);
  });

  it('exits 0 when both request files have non-requested status', async () => {
    await writeJson(path.join(tmpDir, 'pipeline', 'rebuild-request.json'), {
      status: 'completed', requestedBy: 'Robert', reason: 'done',
    });
    await writeJson(path.join(tmpDir, 'pipeline', 'enrichment-request.json'), {
      status: 'completed', type: 'wikidata', requestedBy: 'Robert', reason: 'done',
    });

    const result = run(tmpDir);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('No pending requests'), result.stdout);
  });
});

describe('watch-pipeline-requests.js — dispatch (--dry-run)', () => {
  let tmpDir;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'watcher-dispatch-'));
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('dispatches pipeline:consume for a pending rebuild request', async () => {
    await writeJson(path.join(tmpDir, 'pipeline', 'rebuild-request.json'), {
      status: 'requested', requestedBy: 'Robert', reason: 'staged dataset ready',
    });

    const result = run(tmpDir, ['--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('[DRY RUN]'), result.stdout);
    assert.ok(result.stdout.includes('pipeline:consume'), result.stdout);
    assert.ok(!result.stdout.includes('pipeline:consume:enrichment'), result.stdout);
  });

  it('dispatches pipeline:consume:enrichment for a pending enrichment request', async () => {
    await writeJson(path.join(tmpDir, 'pipeline', 'rebuild-request.json'), {
      status: 'completed', requestedBy: 'Robert', reason: 'done',
    });
    await writeJson(path.join(tmpDir, 'pipeline', 'enrichment-request.json'), {
      status: 'requested', type: 'wikidata', requestedBy: 'Robert', reason: 'refresh fields',
    });

    const result = run(tmpDir, ['--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('[DRY RUN]'), result.stdout);
    assert.ok(result.stdout.includes('pipeline:consume:enrichment'), result.stdout);
  });

  it('rebuild takes priority when both requests are pending', async () => {
    await writeJson(path.join(tmpDir, 'pipeline', 'rebuild-request.json'), {
      status: 'requested', requestedBy: 'Robert', reason: 'priority test',
    });
    await writeJson(path.join(tmpDir, 'pipeline', 'enrichment-request.json'), {
      status: 'requested', type: 'wikidata', requestedBy: 'Robert', reason: 'also pending',
    });

    const result = run(tmpDir, ['--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    // Should log rebuild dispatch, not enrichment
    assert.ok(result.stdout.includes('Rebuild request found'), result.stdout);
    assert.ok(!result.stdout.includes('Enrichment request found'), result.stdout);
  });

  it('logs requestedBy and reason in dispatch message', async () => {
    await writeJson(path.join(tmpDir, 'pipeline', 'rebuild-request.json'), {
      status: 'requested', requestedBy: 'robert-editor', reason: 'new dataset uploaded',
    });
    // Remove enrichment so rebuild is the only candidate
    await writeJson(path.join(tmpDir, 'pipeline', 'enrichment-request.json'), {
      status: 'completed', type: 'wikidata', requestedBy: 'Robert', reason: 'done',
    });

    const result = run(tmpDir, ['--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('robert-editor'), result.stdout);
    assert.ok(result.stdout.includes('new dataset uploaded'), result.stdout);
  });
});

describe('watch-pipeline-requests.js — single active job constraint', () => {
  let tmpDir;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'watcher-running-'));
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('skips dispatch when a job with status running exists', async () => {
    await writeJson(path.join(tmpDir, 'pipeline', 'rebuild-request.json'), {
      status: 'requested', requestedBy: 'Robert', reason: 'should be blocked',
    });
    await writeJson(path.join(tmpDir, 'pipeline', 'jobs', 'job-active.json'), {
      id: 'job-active', type: 'rebuild', status: 'running',
    });

    const result = run(tmpDir, ['--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('already running'), result.stdout);
    assert.ok(!result.stdout.includes('[DRY RUN]'), result.stdout);
  });

  it('dispatches when the only job file has status completed', async () => {
    const tmpDir2 = await mkdtemp(path.join(tmpdir(), 'watcher-done-'));
    try {
      await writeJson(path.join(tmpDir2, 'pipeline', 'rebuild-request.json'), {
        status: 'requested', requestedBy: 'Robert', reason: 'allowed',
      });
      await writeJson(path.join(tmpDir2, 'pipeline', 'jobs', 'job-done.json'), {
        id: 'job-done', type: 'rebuild', status: 'completed',
      });

      const result = run(tmpDir2, ['--dry-run']);
      assert.equal(result.status, 0, result.stderr);
      assert.ok(result.stdout.includes('[DRY RUN]'), result.stdout);
    } finally {
      await rm(tmpDir2, { recursive: true, force: true });
    }
  });
});
