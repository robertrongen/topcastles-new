#!/usr/bin/env node
/**
 * Fills missing latitude/longitude for castles that have none.
 *
 * Strategy per castle (stops at first hit):
 *  1. Wikidata P625 (coordinate location) — via existing wikidata_id field,
 *     or by resolving the wikipedia_url → QID first
 *  2. OpenStreetMap Nominatim geocoding on "{castle_name}, {country}"
 *
 * Only processes castles that already lack coordinates. Run after
 * enrich_wikipedia.js and enrich_wikidata.js so wikidata_id is populated.
 *
 * Usage:
 *   node scripts/enrich_coordinates.js
 *   node scripts/enrich_coordinates.js --dry-run      # first 10 only
 *   node scripts/enrich_coordinates.js --delay 500    # ms between requests (default 400)
 *   node scripts/enrich_coordinates.js --nominatim-only  # skip Wikidata, only Nominatim
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENRICHED_PATH = join(__dirname, '..', 'new_app', 'src', 'assets', 'data', 'castles_enriched.json');

const args = process.argv.slice(2);
const DRY_RUN        = args.includes('--dry-run');
const NOMINATIM_ONLY = args.includes('--nominatim-only');
const DELAY_MS = (() => {
  const idx = args.indexOf('--delay');
  return idx !== -1 ? parseInt(args[idx + 1], 10) : 400;
})();

const HEADERS = { 'User-Agent': 'TopCastles-enrichment/1.0 (rongen.robert@gmail.com)' };
const NOMINATIM_HEADERS = {
  'User-Agent': 'TopCastles-enrichment/1.0 (rongen.robert@gmail.com)',
  'Accept-Language': 'en',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Resolve Wikipedia URL → Wikidata QID. */
async function resolveQid(wikipediaUrl) {
  const match = wikipediaUrl.match(/wikipedia\.org\/wiki\/(.+)$/);
  if (!match) return null;
  const title = decodeURIComponent(match[1]);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageprops&ppprop=wikibase_item&format=json&formatversion=2`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.query?.pages?.[0]?.pageprops?.wikibase_item ?? null;
}

/** Fetch P625 coordinate location for a Wikidata QID. Returns {lat, lon} or null. */
async function wikidataCoords(qid) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims&format=json&formatversion=2`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const entity = data?.entities?.[qid];
  const claim = entity?.claims?.P625?.[0];
  const val = claim?.mainsnak?.datavalue?.value;
  if (val?.latitude == null || val?.longitude == null) return null;
  return { lat: val.latitude, lon: val.longitude };
}

/** Geocode via Nominatim. Returns {lat, lon} or null. */
async function nominatimCoords(name, country) {
  const stripped = name.replace(/\s*\(.*\)/g, '').trim();
  const q = encodeURIComponent(`${stripped}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&featuretype=historic`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.[0];
  if (!hit) return null;
  return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) };
}

async function getCoords(castle) {
  if (NOMINATIM_ONLY) {
    return nominatimCoords(castle.castle_name, castle.country);
  }

  // Try Wikidata P625 first
  let qid = castle.wikidata_id ?? null;
  if (!qid && castle.wikipedia_url) {
    qid = await resolveQid(castle.wikipedia_url);
    await sleep(200);
  }
  if (qid) {
    const coords = await wikidataCoords(qid);
    if (coords) return { ...coords, _method: 'wikidata', _qid: qid };
    await sleep(200);
  }

  // Nominatim fallback
  const coords = await nominatimCoords(castle.castle_name, castle.country);
  if (coords) return { ...coords, _method: 'nominatim' };

  return null;
}

async function main() {
  const castles = JSON.parse(readFileSync(ENRICHED_PATH, 'utf8'));
  const missing = castles.filter(c => c.latitude == null || c.longitude == null);
  const target  = DRY_RUN ? missing.slice(0, 10) : missing;

  console.log(`Total castles: ${castles.length}`);
  console.log(`Missing coords: ${missing.length}`);
  console.log(`To process: ${target.length}${DRY_RUN ? ' (dry-run)' : ''}`);
  console.log(`Delay: ${DELAY_MS}ms | Strategy: ${NOMINATIM_ONLY ? 'Nominatim only' : 'Wikidata P625 → Nominatim'}\n`);

  const byCode = new Map(castles.map(c => [c.castle_code, { ...c }]));
  let wdHits = 0, nomHits = 0, misses = 0;

  for (let i = 0; i < target.length; i++) {
    const castle = target[i];
    process.stdout.write(`[${i + 1}/${target.length}] ${castle.castle_name} ... `);

    const result = await getCoords(castle);

    if (result) {
      const { lat, lon, _method, _qid } = result;
      const existing = byCode.get(castle.castle_code);
      byCode.set(castle.castle_code, {
        ...existing,
        latitude:  Math.round(lat * 1e6) / 1e6,
        longitude: Math.round(lon * 1e6) / 1e6,
        // Persist discovered QID if we found one and it wasn't stored yet
        ...(_qid && !existing.wikidata_id ? { wikidata_id: _qid } : {}),
      });
      if (_method === 'wikidata') wdHits++;
      else nomHits++;
      console.log(`${_method} → ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } else {
      misses++;
      console.log('not found');
    }

    if (i < target.length - 1) await sleep(DELAY_MS);
  }

  const enriched = castles.map(c => byCode.get(c.castle_code));
  writeFileSync(ENRICHED_PATH, JSON.stringify(enriched, null, 2), 'utf8');

  console.log(`\nDone.`);
  console.log(`  Wikidata hits: ${wdHits}`);
  console.log(`  Nominatim hits: ${nomHits}`);
  console.log(`  Not found: ${misses}`);
  console.log(`Written: ${ENRICHED_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
