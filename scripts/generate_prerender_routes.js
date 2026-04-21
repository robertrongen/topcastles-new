#!/usr/bin/env node
/**
 * Generates new_app/prerender-routes.txt for Angular's build-time prerendering.
 *
 * Included routes:
 *   - Static pages: /, /top1000, /top-countries, /top-regions, /background, /developer
 *   - Castle detail pages: /castles/:code  (~1000 entries from castles_enriched.json)
 *
 * Run after updating castles_enriched.json, then rebuild the app.
 * Usage: node scripts/generate_prerender_routes.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const dataFile   = join(__dirname, '../new_app/src/assets/data/castles_enriched.json');
const outputFile = join(__dirname, '../new_app/prerender-routes.txt');

const castles = JSON.parse(readFileSync(dataFile, 'utf8'));

const staticRoutes = [
  '/',
  '/top1000',
  '/top-countries',
  '/top-regions',
  '/background',
  '/developer',
];

const castleRoutes = castles.map(c => `/castles/${c.castle_code}`);

const allRoutes = [...staticRoutes, ...castleRoutes];

writeFileSync(outputFile, allRoutes.join('\n') + '\n', 'utf8');

console.log(`Written ${allRoutes.length} routes to ${outputFile}`);
console.log(`  ${staticRoutes.length} static routes`);
console.log(`  ${castleRoutes.length} castle detail routes`);
