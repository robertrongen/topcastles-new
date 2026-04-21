#!/usr/bin/env node
/**
 * Derives two app data files from the authoritative castles_enriched.json:
 *
 *   castles.json       — lean file loaded at app startup (~100 kB gzipped)
 *                        Contains only fields needed for table, grid, filters,
 *                        and map view. wikipedia_thumbnail included for fallback
 *                        images in table/grid.
 *
 *   castles_delta.json — delta file lazy-loaded on first detail page visit
 *                        Contains castle_code + enriched-only fields; the service
 *                        merges it with the lean data by castle_code.
 *
 * castles_enriched.json is the source of truth and is never modified by this
 * script. It continues to be used by the API generator and enrichment scripts.
 *
 * Run after any enrichment script that updates castles_enriched.json:
 *   node scripts/generate_lean_castles.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT   = join(__dirname, '..');
const DATA_DIR    = join(REPO_ROOT, 'new_app', 'src', 'assets', 'data');
const ENRICHED    = join(DATA_DIR, 'castles_enriched.json');
const LEAN_OUT    = join(DATA_DIR, 'castles.json');
const DELTA_OUT   = join(DATA_DIR, 'castles_delta.json');

const LEAN_FIELDS = [
  'position', 'castle_code', 'castle_name', 'country',
  'place', 'region', 'region_code',
  'castle_type', 'castle_concept', 'condition', 'era',
  'area', 'founder',
  'latitude', 'longitude',
  'score_total', 'score_visitors',
  'wikipedia_thumbnail',
];

// Fields only needed on the detail page — excluded from lean, included in delta.
const DELTA_FIELDS = [
  'castle_code',
  'description', 'remarkable', 'visitors', 'website',
  'wikipedia_extract', 'wikipedia_url',
  'wikidata_id', 'architectural_style', 'heritage_status',
  'inception_year', 'wikidata_image', 'wikidata_founder',
  'architect', 'wikidata_website', 'significant_events',
];

// Fields concatenated into search_text so full-text search works on the lean file.
const SEARCH_TEXT_FIELDS = [
  'castle_name', 'country', 'place', 'region', 'area',
  'founder', 'castle_type', 'castle_concept', 'condition',
  'description', 'remarkable',
];

function pick(obj, fields) {
  const result = {};
  for (const field of fields) {
    result[field] = Object.prototype.hasOwnProperty.call(obj, field) ? obj[field] : null;
  }
  return result;
}

function buildSearchText(castle) {
  return SEARCH_TEXT_FIELDS
    .map(f => castle[f] ?? '')
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

const enriched = JSON.parse(readFileSync(ENRICHED, 'utf8'));

const lean = enriched.map(c => ({ ...pick(c, LEAN_FIELDS), search_text: buildSearchText(c) }));
const delta = enriched.map(c => pick(c, DELTA_FIELDS));

writeFileSync(LEAN_OUT,  JSON.stringify(lean,  null, 2), 'utf8');
writeFileSync(DELTA_OUT, JSON.stringify(delta, null, 2), 'utf8');

console.log(`✓ Wrote ${lean.length} lean castles → ${LEAN_OUT}`);
console.log(`  Lean fields (${LEAN_FIELDS.length}): ${LEAN_FIELDS.join(', ')}`);
console.log(`✓ Wrote ${delta.length} delta records → ${DELTA_OUT}`);
console.log(`  Delta fields (${DELTA_FIELDS.length}): ${DELTA_FIELDS.join(', ')}`);
