#!/usr/bin/env node
/**
 * Developer-machine enrichment consumer (Track B2, Phase 7).
 *
 * Reads data/pipeline/enrichment-request.json, runs the appropriate
 * enrichment script(s) for the requested type, then runs
 * data:merge-overrides and data:lean to regenerate downstream artefacts.
 *
 * Does NOT run npm run build — rebuild remains a separate manual step.
 * Must be run from the project root on a developer machine.
 *
 * Usage:
 *   node scripts/consume-pipeline-enrichment-request.js
 *   DATA_DIR=/custom/path node scripts/consume-pipeline-enrichment-request.js
 */

import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { createWriteStream } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR ?? path.join(ROOT, 'data');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const PATHS = {
  enrichmentRequest: path.join(DATA_DIR, 'pipeline', 'enrichment-request.json'),
  enrichmentHistory: path.join(DATA_DIR, 'pipeline', 'enrichment-history.json'),
  logsDir:           path.join(DATA_DIR, 'pipeline', 'logs'),
};

const ENRICHMENT_STEPS = {
  wikidata:    ['data:enrich:wikidata'],
  wikipedia:   ['data:enrich:wikipedia'],
  coordinates: ['data:enrich:coordinates'],
  full:        ['data:enrich:wikidata', 'data:enrich:wikipedia', 'data:enrich:coordinates'],
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
  const existing = await readJsonFile(PATHS.enrichmentHistory) ?? [];
  await writeJsonFile(PATHS.enrichmentHistory, [...existing, entry]);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const request = await readJsonFile(PATHS.enrichmentRequest);
  if (!request) {
    console.error('No enrichment request found at', PATHS.enrichmentRequest);
    console.error('Stage an enrichment request from /admin/pipeline first.');
    process.exit(1);
  }

  const { type } = request;
  const steps = ENRICHMENT_STEPS[type];
  if (!steps) {
    console.error(`Unknown enrichment type: ${type}`);
    console.error(`Allowed types: ${Object.keys(ENRICHMENT_STEPS).join(', ')}`);
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logFile = path.join(PATHS.logsDir, `${timestamp}-enrichment.log`);
  await mkdir(PATHS.logsDir, { recursive: true });
  const logStream = createWriteStream(logFile, { encoding: 'utf-8' });
  const log = createLogger(logStream);

  log.write('=== Enrichment consumer started ===');
  log.write(`Request: ${JSON.stringify(request)}`);
  log.write(`Log: ${logFile}`);

  let success = false;
  let errorMessage = null;

  try {
    for (const script of steps) {
      log.write(`Running npm run ${script}…`);
      await runStep(NPM, ['run', script], { log, cwd: ROOT });
      log.write(`${script} complete.`);
    }

    log.write('Running npm run data:merge-overrides…');
    await runStep(NPM, ['run', 'data:merge-overrides'], { log, cwd: ROOT });
    log.write('data:merge-overrides complete.');

    log.write('Running npm run data:lean…');
    await runStep(NPM, ['run', 'data:lean'], { log, cwd: ROOT });
    log.write('data:lean complete.');

    success = true;
  } catch (err) {
    errorMessage = err.message;
    log.write(`ERROR: ${err.message}`);
  }

  const completedAt = new Date().toISOString();
  const resultStatus = success ? 'completed' : 'failed';

  await writeJsonFile(PATHS.enrichmentRequest, {
    ...request,
    status: resultStatus,
    completedAt,
    logFile: path.relative(ROOT, logFile).replace(/\\/g, '/'),
    ...(errorMessage ? { errorMessage } : {}),
  });

  await appendHistory({
    requestedAt: request.requestedAt,
    requestedBy: request.requestedBy,
    type: request.type,
    reason: request.reason,
    status: resultStatus,
    completedAt,
    logFile: path.relative(ROOT, logFile).replace(/\\/g, '/'),
    ...(errorMessage ? { errorMessage } : {}),
  });

  log.write(`=== Enrichment consumer finished: ${resultStatus} ===`);
  logStream.end();

  if (!success) {
    console.error(`\nEnrichment failed. See log: ${logFile}`);
    process.exit(1);
  }

  console.log(`\nEnrichment succeeded. Log: ${logFile}`);
  console.log('If a rebuild is required, run: npm run pipeline:consume');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
