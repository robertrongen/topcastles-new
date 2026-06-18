/**
 * Integration tests for consume-pipeline-enrichment-request.js.
 *
 * The success path uses a fake npm executable at the front of PATH so no real
 * enrichment, merge, lean, or build-time artifact mutation occurs.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile, readdir } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, 'consume-pipeline-enrichment-request.js');

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function runScript(env = {}) {
  return spawnSync(process.execPath, [SCRIPT], {
    env: { ...process.env, ...env },
    encoding: 'utf-8',
    timeout: 30_000,
  });
}

async function writeFakeNpm(binDir, logFile) {
  await mkdir(binDir, { recursive: true });
  if (process.platform === 'win32') {
    await writeFile(
      path.join(binDir, 'npm.cmd'),
      `@echo off\r\necho %*>>"${logFile}"\r\nexit /b 0\r\n`,
      'utf-8'
    );
  } else {
    const file = path.join(binDir, 'npm');
    await writeFile(
      file,
      `#!/bin/sh\nprintf '%s\\n' "$*" >> "${logFile}"\nexit 0\n`,
      { encoding: 'utf-8', mode: 0o755 }
    );
  }
}

describe('consume-pipeline-enrichment-request.js - preflight checks', () => {
  let tmpDir;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'enrichment-consumer-preflight-'));
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('exits 1 with helpful message when no enrichment request exists', () => {
    const result = runScript({ DATA_DIR: tmpDir });
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes('No enrichment request found'), result.stderr);
  });

  it('exits 1 with helpful message when enrichment type is unknown', async () => {
    await writeJson(path.join(tmpDir, 'pipeline', 'enrichment-request.json'), {
      requestedAt: '2026-05-05T12:00:00.000Z',
      requestedBy: 'Robert',
      type: 'unknown',
      reason: 'bad request',
      status: 'requested',
    });

    const result = runScript({ DATA_DIR: tmpDir });
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes('Unknown enrichment type'), result.stderr);
  });
});

describe('consume-pipeline-enrichment-request.js - successful run', () => {
  let tmpDir;
  let fakeBinDir;
  let fakeNpmLog;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'enrichment-consumer-success-'));
    fakeBinDir = await mkdtemp(path.join(tmpdir(), 'enrichment-consumer-bin-'));
    fakeNpmLog = path.join(tmpDir, 'fake-npm.log');

    await writeFakeNpm(fakeBinDir, fakeNpmLog);
    await writeJson(path.join(tmpDir, 'pipeline', 'enrichment-request.json'), {
      requestedAt: '2026-05-05T12:00:00.000Z',
      requestedBy: 'Robert',
      type: 'wikidata',
      reason: 'refresh missing fields',
      status: 'requested',
    });
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    await rm(fakeBinDir, { recursive: true, force: true });
  });

  it('script exits 0 and dispatches the expected npm scripts', async () => {
    const result = runScript({
      DATA_DIR: tmpDir,
      PATH: `${fakeBinDir}${path.delimiter}${process.env.PATH}`,
      Path: `${fakeBinDir}${path.delimiter}${process.env.Path ?? process.env.PATH}`,
    });

    assert.equal(result.status, 0, result.stderr);
    const log = await readFile(fakeNpmLog, 'utf-8');
    assert.ok(log.includes('run data:enrich:wikidata'), log);
    assert.ok(log.includes('run data:merge-overrides'), log);
    assert.ok(log.includes('run data:lean'), log);
    assert.ok(!log.includes('run build'), log);
  });

  it('enrichment request is completed with a data-relative log path', async () => {
    const req = await readJson(path.join(tmpDir, 'pipeline', 'enrichment-request.json'));
    assert.equal(req.status, 'completed');
    assert.ok(typeof req.completedAt === 'string');
    assert.match(req.logFile, /^pipeline\/logs\/.+-enrichment\.log$/);
  });

  it('history entry is appended with completion status', async () => {
    const history = await readJson(path.join(tmpDir, 'pipeline', 'enrichment-history.json'));
    assert.ok(Array.isArray(history));
    const last = history.at(-1);
    assert.equal(last.status, 'completed');
    assert.equal(last.type, 'wikidata');
    assert.match(last.logFile, /^pipeline\/logs\/.+-enrichment\.log$/);
  });

  it('job record is written and points at a readable enrichment log', async () => {
    const jobFiles = await readdir(path.join(tmpDir, 'pipeline', 'jobs'));
    assert.equal(jobFiles.length, 1);
    const job = await readJson(path.join(tmpDir, 'pipeline', 'jobs', jobFiles[0]));
    assert.equal(job.type, 'enrichment');
    assert.equal(job.enrichmentType, 'wikidata');
    assert.equal(job.status, 'completed');
    assert.equal(job.requestedBy, 'Robert');
    assert.match(job.logFile, /^pipeline\/logs\/.+-enrichment\.log$/);

    const log = await readFile(path.join(tmpDir, job.logFile), 'utf-8');
    assert.ok(log.includes('Enrichment consumer started'), log);
    assert.ok(log.includes('Enrichment consumer finished: completed'), log);
  });
});
