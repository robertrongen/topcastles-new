#!/usr/bin/env node
/**
 * Build-time merge step (Track B2, Phase 6).
 *
 * Reads castle-overrides.json and applies it to castles_enriched.json:
 *   - Existing castle: override fields replace enriched fields (override wins).
 *   - New castle draft: appended with the next sequential position after the
 *     current highest position in the enriched dataset.
 *
 * Writes a merge report to data/pipeline/merge-report.json and emits a
 * stdout summary.
 *
 * Run via:  npm run data:merge-overrides
 * Or:       node scripts/apply_castle_overrides.js
 *
 * Env vars (all optional — defaults suit developer-machine use):
 *   CASTLES_ENRICHED_PATH  path to castles_enriched.json
 *   DATA_DIR               root of the runtime data volume
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');

const ENRICHED_PATH =
  process.env.CASTLES_ENRICHED_PATH ??
  path.join(ROOT, 'new_app', 'src', 'assets', 'data', 'castles_enriched.json');

const DATA_DIR    = process.env.DATA_DIR ?? path.join(ROOT, 'data');
const OVERRIDES_PATH = path.join(DATA_DIR, 'pipeline', 'castle-overrides.json');
const REPORT_PATH    = path.join(DATA_DIR, 'pipeline', 'merge-report.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJsonFile(filePath) {
  const text = readFileSync(filePath, 'utf-8').replace(/^﻿/, '');
  return JSON.parse(text);
}

function writeJsonFile(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Main ──────────────────────────────────────────────────────────────────────

function run() {
  // 1. Load enriched dataset
  const enriched = readJsonFile(ENRICHED_PATH);

  // 2. Load overrides — skip gracefully if file absent
  if (!existsSync(OVERRIDES_PATH)) {
    console.log('[merge-overrides] No castle-overrides.json found — skipping.');
    return;
  }

  const overrides = readJsonFile(OVERRIDES_PATH);
  const overrideCodes = Object.keys(overrides);

  if (overrideCodes.length === 0) {
    console.log('[merge-overrides] castle-overrides.json is empty — nothing to apply.');
    return;
  }

  // 3. Build lookup map (castle_code → record index for O(1) updates)
  const indexMap = new Map(enriched.map((c, i) => [c.castle_code, i]));

  // 4. Determine next position for new drafts
  const maxPosition = enriched.reduce((max, c) => Math.max(max, c.position ?? 0), 0);
  let nextPosition = maxPosition + 1;

  const applied = [];
  const added   = [];

  for (const [code, fields] of Object.entries(overrides)) {
    const idx = indexMap.get(code);

    if (idx !== undefined) {
      // Existing castle: merge override fields in place (override wins)
      enriched[idx] = { ...enriched[idx], ...fields };
      applied.push(code);
    } else {
      // New castle draft: append with next sequential position
      const newCastle = {
        ...fields,
        castle_code:    code,
        position:       nextPosition++,
        score_total:    fields.score_total    ?? 0,
        score_visitors: fields.score_visitors ?? 0,
        visitors:       fields.visitors       ?? 0,
      };
      enriched.push(newCastle);
      added.push(code);
    }
  }

  // 5. Write modified enriched dataset back
  writeJsonFile(ENRICHED_PATH, enriched);

  // 6. Write merge report
  const appliedAt = new Date().toISOString();
  const report = {
    appliedAt,
    overridesApplied: applied.length,
    newCastlesAdded:  added.length,
    applied,
    added,
  };
  writeJsonFile(REPORT_PATH, report);

  // 7. Stdout summary
  if (applied.length) {
    console.log(
      `[merge-overrides] Applied ${applied.length} override(s): ${applied.join(', ')}`
    );
  }
  if (added.length) {
    console.log(
      `[merge-overrides] Added ${added.length} new castle draft(s): ${added.join(', ')}`
    );
  }
  console.log(`[merge-overrides] Merge complete. Report: ${path.relative(ROOT, REPORT_PATH)}`);
}

run();
