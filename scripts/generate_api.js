#!/usr/bin/env node
// Generates static JSON API slices from castles_enriched.json into new_app/public/api/
// Run: node scripts/generate_api.js

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC  = join(ROOT, 'new_app/src/assets/data/castles_enriched.json');
const OUT  = join(ROOT, 'new_app/public/api');

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function write(relPath, data) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2), 'utf8');
  console.log(`  wrote ${relPath}  (${Array.isArray(data) ? data.length + ' records' : 'object'})`);
}

const all = JSON.parse(readFileSync(SRC, 'utf8'));
const byScore = [...all].sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0));

// All castles
write('castles.json', byScore);

// Top 100
write('top100.json', byScore.slice(0, 100));

// By country
const countries = {};
for (const c of byScore) {
  if (!c.country) continue;
  const key = slug(c.country);
  if (!countries[key]) countries[key] = [];
  countries[key].push(c);
}
for (const [key, castles] of Object.entries(countries)) {
  write(`by-country/${key}.json`, castles);
}

// Index / manifest
const countryIndex = Object.entries(countries).map(([key, castles]) => ({
  country: castles[0].country,
  slug: key,
  count: castles.length,
  url: `/api/by-country/${key}.json`,
})).sort((a, b) => a.country.localeCompare(b.country));

const index = {
  version: '1.0',
  generated: new Date().toISOString().split('T')[0],
  totalCastles: all.length,
  endpoints: {
    allCastles:   { url: '/api/castles.json',   description: 'All castles sorted by score descending' },
    top100:       { url: '/api/top100.json',     description: 'Top 100 castles by score' },
    byCountry:    { url: '/api/by-country/{country-slug}.json', description: 'Castles filtered by country' },
    openApiSpec:  { url: '/api/openapi.yaml',   description: 'OpenAPI 3.0 specification' },
  },
  countries: countryIndex,
};
write('index.json', index);

console.log(`\nDone — ${all.length} castles, ${Object.keys(countries).length} country files.`);
