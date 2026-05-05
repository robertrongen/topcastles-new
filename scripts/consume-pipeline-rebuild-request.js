#!/usr/bin/env node
/**
 * Developer-machine rebuild consumer (Track B2, Phase 4).
 *
 * Reads data/pipeline/rebuild-request.json, validates the staged enriched
 * file, copies it into the app source tree, runs npm run data:regenerate
 * and npm run build, then writes results back to the pipeline ledger.
 *
 * Must be run from the project root on a developer machine.
 * Does not run deploy.sh — deployment remains manual.
 *
 * Usage:
 *   node scripts/consume-pipeline-rebuild-request.js
 *   DATA_DIR=/custom/path node scripts/consume-pipeline-rebuild-request.js
 */

import { readFile, writeFile, mkdir, copyFile, rename } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR ?? path.join(ROOT, 'data');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const PATHS = {
  rebuildRequest: path.join(DATA_DIR, 'pipeline', 'rebuild-request.json'),
  rebuildHistory: path.join(DATA_DIR, 'pipeline', 'rebuild-history.json'),
  pipelineMeta:   path.join(DATA_DIR, 'pipeline', 'meta.json'),
  pendingEnriched: path.join(DATA_DIR, 'pending', 'castles_enriched.json'),
  targetEnriched:  path.join(ROOT, 'new_app', 'src', 'assets', 'data', 'castles_enriched.json'),
  logsDir:         path.join(DATA_DIR, 'pipeline', 'logs'),
  jobsDir:         path.join(DATA_DIR, 'pipeline', 'jobs'),
};

// ── File helpers ──────────────────────────────────────────────────────────────

async function readJsonFile(filePath) {
  try {
    const text = await readFile(filePath, 'utf-8');
    return JSON.parse(text.replace(/^﻿/, '').trim());
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function writeJsonFile(filePath, data) {
  const tmp = filePath + '.tmp';
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await rename(tmp, filePath);
}

// ── Logger ────────────────────────────────────────────────────────────────────

function createLogger(logStream) {
  function write(line) {
    const stamped = `[${new Date().toISOString()}] ${line}`;
    console.log(stamped);
    logStream.write(stamped + '\n');
  }
  return { write };
}

// ── Subprocess helper ─────────────────────────────────────────────────────────

function runStep(command, args, { log, cwd }) {
  return new Promise((resolve, reject) => {
    log.write(`> ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });

    child.stdout.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        log.write(`  ${line}`);
      }
    });

    child.stderr.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        log.write(`  ${line}`);
      }
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        log.write(`  exit 0`);
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

// ── History append ────────────────────────────────────────────────────────────

async function appendHistory(entry) {
  const existing = await readJsonFile(PATHS.rebuildHistory) ?? [];
  await writeJsonFile(PATHS.rebuildHistory, [...existing, entry]);
}

// ── Job record ────────────────────────────────────────────────────────────────

function generateJobId() {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15);
  const rand = Math.random().toString(36).slice(2, 6);
  return `job-${ts}-${rand}`;
}

async function writeJobFile(job) {
  await mkdir(PATHS.jobsDir, { recursive: true });
  await writeJsonFile(path.join(PATHS.jobsDir, `${job.id}.json`), job);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Read rebuild request
  const request = await readJsonFile(PATHS.rebuildRequest);
  if (!request) {
    console.error('No rebuild request found at', PATHS.rebuildRequest);
    console.error('Stage a rebuild request from /admin/pipeline first.');
    process.exit(1);
  }

  // 2. Validate staged file
  if (!existsSync(PATHS.pendingEnriched)) {
    console.error('Staged enriched file not found at', PATHS.pendingEnriched);
    console.error('Upload a castles_enriched.json via /admin/upload-enriched first.');
    process.exit(1);
  }

  // 3. Open log file and register job record
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logFile = path.join(PATHS.logsDir, `${timestamp}-rebuild.log`);
  await mkdir(PATHS.logsDir, { recursive: true });
  const logStream = createWriteStream(logFile, { encoding: 'utf-8' });
  const log = createLogger(logStream);

  const jobId = generateJobId();
  const logFileRelative = path.relative(DATA_DIR, logFile).replace(/\\/g, '/');
  const job = {
    id: jobId,
    type: 'rebuild',
    status: 'running',
    requestedBy: request.requestedBy ?? null,
    reason: request.reason ?? null,
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    logFile: logFileRelative,
    errorMessage: null,
  };
  await writeJobFile(job);

  log.write('=== Rebuild consumer started ===');
  log.write(`Job: ${jobId}`);
  log.write(`Request: ${JSON.stringify(request)}`);
  log.write(`Staged file: ${PATHS.pendingEnriched}`);
  log.write(`Log: ${logFile}`);

  let success = false;
  let errorMessage = null;

  try {
    // 4. Copy staged file into source tree
    log.write('Copying staged castles_enriched.json to source tree…');
    await copyFile(PATHS.pendingEnriched, PATHS.targetEnriched);
    log.write('Copy complete.');

    // 5. Run data regeneration
    log.write('Running npm run data:regenerate…');
    await runStep(NPM, ['run', 'data:regenerate'], { log, cwd: ROOT });
    log.write('data:regenerate complete.');

    // 6. Run build
    log.write('Running npm run build…');
    await runStep(NPM, ['run', 'build'], { log, cwd: ROOT });
    log.write('build complete.');

    success = true;
  } catch (err) {
    errorMessage = err.message;
    log.write(`ERROR: ${err.message}`);
  }

  const completedAt = new Date().toISOString();
  const resultStatus = success ? 'completed' : 'failed';

  // 7. Update rebuild-request.json with outcome
  await writeJsonFile(PATHS.rebuildRequest, {
    ...request,
    status: resultStatus,
    completedAt,
    logFile: path.relative(ROOT, logFile).replace(/\\/g, '/'),
    ...(errorMessage ? { errorMessage } : {}),
  });

  // 8a. Update job record with final status
  await writeJobFile({
    ...job,
    status: resultStatus,
    completedAt,
    ...(errorMessage ? { errorMessage } : {}),
  });

  // 9. Append completion entry to history
  await appendHistory({
    requestedAt: request.requestedAt,
    requestedBy: request.requestedBy,
    reason: request.reason,
    status: resultStatus,
    completedAt,
    logFile: path.relative(ROOT, logFile).replace(/\\/g, '/'),
    ...(errorMessage ? { errorMessage } : {}),
  });

  // 10. Update pipeline meta lastBuildAt on success
  if (success) {
    const meta = await readJsonFile(PATHS.pipelineMeta) ?? {};
    await writeJsonFile(PATHS.pipelineMeta, { ...meta, lastBuildAt: completedAt });
    log.write('Pipeline meta updated: lastBuildAt set.');
  }

  log.write(`=== Rebuild consumer finished: ${resultStatus} ===`);
  logStream.end();

  if (!success) {
    console.error(`\nRebuild failed. See log: ${logFile}`);
    process.exit(1);
  }

  console.log(`\nRebuild succeeded. Log: ${logFile}`);
  console.log('Deploy manually when ready: ./deploy.sh');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
