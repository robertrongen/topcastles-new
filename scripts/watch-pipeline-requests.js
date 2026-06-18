#!/usr/bin/env node
/**
 * Developer-machine pipeline request watcher (Track B2, Phase 9).
 *
 * Polls DATA_DIR/pipeline/ for pending rebuild or enrichment requests.
 * When a request is found and no job is currently running, dispatches to the
 * appropriate consumer script and waits for it to finish before polling again.
 *
 * This script delegates all pipeline logic to existing consumer scripts.
 * It must NOT run inside the runtime container.
 *
 * Usage:
 *   npm run pipeline:watch
 *   DATA_DIR=/custom/path POLL_INTERVAL_MS=15000 npm run pipeline:watch
 *
 * Flags:
 *   --once      Poll once then exit (useful for CI, scripting, and tests)
 *   --dry-run   Log what would be dispatched without spawning anything
 */

import { readFile, readdir } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');
const DATA_DIR  = process.env.DATA_DIR ?? path.join(ROOT, 'data');
const NPM       = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const POLL_MS   = parseInt(process.env.POLL_INTERVAL_MS ?? '10000', 10);

const args     = process.argv.slice(2);
const ONCE     = args.includes('--once');
const DRY_RUN  = args.includes('--dry-run');

const PATHS = {
  rebuildRequest:    path.join(DATA_DIR, 'pipeline', 'rebuild-request.json'),
  enrichmentRequest: path.join(DATA_DIR, 'pipeline', 'enrichment-request.json'),
  jobsDir:           path.join(DATA_DIR, 'pipeline', 'jobs'),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] [pipeline:watch] ${msg}`);
}

async function readJsonFile(filePath) {
  try {
    const text = await readFile(filePath, 'utf-8');
    return JSON.parse(text.replace(/^﻿/, '').trim());
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function hasRunningJob() {
  let files;
  try {
    files = await readdir(PATHS.jobsDir);
  } catch {
    return false;
  }
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const job = await readJsonFile(path.join(PATHS.jobsDir, file));
    if (job?.status === 'running') return true;
  }
  return false;
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

let currentChild = null;
let shutdownRequested = false;

function dispatch(npmScript) {
  if (DRY_RUN) {
    log(`[DRY RUN] would dispatch: npm run ${npmScript}`);
    return Promise.resolve(0);
  }
  log(`Dispatching: npm run ${npmScript}`);
  return new Promise((resolve) => {
    currentChild = spawn(NPM, ['run', npmScript], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    currentChild.on('error', (err) => {
      log(`Failed to spawn npm run ${npmScript}: ${err.message}`);
      currentChild = null;
      resolve(1);
    });
    currentChild.on('close', (code) => {
      currentChild = null;
      if (shutdownRequested) process.exit(0);
      resolve(code ?? 1);
    });
  });
}

// ── Poll ──────────────────────────────────────────────────────────────────────

async function poll() {
  if (await hasRunningJob()) {
    log('A job is already running — skipping dispatch.');
    return;
  }

  const rebuild = await readJsonFile(PATHS.rebuildRequest);
  if (rebuild?.status === 'requested') {
    log(`Rebuild request found (by ${rebuild.requestedBy}): ${rebuild.reason}`);
    const code = await dispatch('pipeline:consume');
    log(`pipeline:consume exited with code ${code}.`);
    return;
  }

  const enrichment = await readJsonFile(PATHS.enrichmentRequest);
  if (enrichment?.status === 'requested') {
    log(`Enrichment request found (type: ${enrichment.type}, by ${enrichment.requestedBy}): ${enrichment.reason}`);
    const code = await dispatch('pipeline:consume:enrichment');
    log(`pipeline:consume:enrichment exited with code ${code}.`);
    return;
  }

  log('No pending requests.');
}

// ── Shutdown ──────────────────────────────────────────────────────────────────

function handleShutdown() {
  process.stdout.write('\n');
  log('Shutdown requested.');
  shutdownRequested = true;
  if (!currentChild) process.exit(0);
  log('Waiting for current job to finish before exiting...');
}

process.on('SIGINT',  handleShutdown);
process.on('SIGTERM', handleShutdown);

// ── Main ──────────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (ONCE) {
    await poll();
    return;
  }

  log(`Started. Polling every ${POLL_MS}ms. Ctrl-C to stop.`);
  await poll();

  while (!shutdownRequested) {
    await sleep(POLL_MS);
    if (!shutdownRequested) await poll();
  }
}

main().catch((err) => {
  log(`Unexpected error: ${err.message}`);
  process.exit(1);
});
