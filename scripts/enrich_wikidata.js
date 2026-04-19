#!/usr/bin/env node
/**
 * Enriches castles_enriched.json with Wikidata structured data.
 *
 * For each castle that has a wikipedia_url it resolves the Wikidata QID via
 * the MediaWiki action API, then fetches selected claims from Wikidata:
 *   P149  → architectural_style  (label string)
 *   P1435 → heritage_status      (label string, e.g. "UNESCO World Heritage Site")
 *   P571  → inception            (year integer)
 *   P18   → wikidata_image       (Wikimedia Commons filename → usable URL)
 *
 * Writes new_app/src/assets/data/castles_enriched.json in-place (reads the
 * file produced by enrich_wikipedia.js and overwrites it with added fields).
 *
 * Usage:
 *   node scripts/enrich_wikidata.js
 *   node scripts/enrich_wikidata.js --dry-run     # process first 5 only
 *   node scripts/enrich_wikidata.js --delay 400   # ms between requests (default 300)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const ENRICHED_PATH = join(REPO_ROOT, 'new_app', 'src', 'assets', 'data', 'castles_enriched.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DELAY_MS = (() => {
  const idx = args.indexOf('--delay');
  return idx !== -1 ? parseInt(args[idx + 1], 10) : 300;
})();

const HEADERS = { 'User-Agent': 'TopCastles-enrichment/1.0 (rongen.robert@gmail.com)' };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Resolve Wikipedia page title → Wikidata QID via the action API. */
async function resolveQid(wikipediaUrl) {
  // Extract page title from URL: https://en.wikipedia.org/wiki/Tower_of_London
  const match = wikipediaUrl.match(/wikipedia\.org\/wiki\/(.+)$/);
  if (!match) return null;
  const title = decodeURIComponent(match[1]);

  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageprops&ppprop=wikibase_item&format=json&formatversion=2`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const page = data?.query?.pages?.[0];
  return page?.pageprops?.wikibase_item ?? null;
}

/** Fetch selected claims for a QID from the Wikidata REST API. */
async function fetchClaims(qid) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims|labels&languages=en&format=json&formatversion=2`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.entities?.[qid] ?? null;
}

/** Resolve a Wikidata item QID to its English label. */
async function resolveLabel(qid) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=labels&languages=en&format=json&formatversion=2`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.entities?.[qid]?.labels?.en?.value ?? null;
}

/** Get the first string value of a claim property. */
function claimString(entity, prop) {
  const claims = entity?.claims?.[prop];
  if (!claims?.length) return null;
  return claims[0]?.mainsnak?.datavalue?.value ?? null;
}

/** Get the first item QID value of a claim property. */
function claimItemQid(entity, prop) {
  const claims = entity?.claims?.[prop];
  if (!claims?.length) return null;
  return claims[0]?.mainsnak?.datavalue?.value?.id ?? null;
}

/** Build a usable Wikimedia Commons image URL from a filename. */
function commonsImageUrl(filename) {
  if (!filename) return null;
  const clean = filename.replace(/ /g, '_');
  const md5 = (() => {
    // Simple MD5-based path: use the first two hex chars of md5(filename)
    // Since we can't easily compute MD5 in ESM without a dep, use the API URL form instead.
    return null;
  })();
  // Use the Wikimedia thumbnail API — 800px wide
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=800`;
}

async function enrichOne(castle) {
  if (!castle.wikipedia_url) return {};

  const qid = await resolveQid(castle.wikipedia_url);
  if (!qid) return {};

  const entity = await fetchClaims(qid);
  if (!entity) return { wikidata_id: qid };

  const result = { wikidata_id: qid };

  // P149 — architectural style
  const styleQid = claimItemQid(entity, 'P149');
  if (styleQid) {
    await sleep(100);
    result.architectural_style = await resolveLabel(styleQid);
  }

  // P1435 — heritage designation
  const heritageQid = claimItemQid(entity, 'P1435');
  if (heritageQid) {
    await sleep(100);
    result.heritage_status = await resolveLabel(heritageQid);
  }

  // P571 — inception date → year only
  const inceptionVal = entity?.claims?.P571?.[0]?.mainsnak?.datavalue?.value;
  if (inceptionVal?.time) {
    // Format: "+1078-00-00T00:00:00Z"
    const year = parseInt(inceptionVal.time.replace(/^[+-]/, '').slice(0, 4), 10);
    if (!isNaN(year) && year > 0) result.inception_year = year;
  }

  // P18 — image
  const imageFilename = claimString(entity, 'P18');
  if (imageFilename) result.wikidata_image = commonsImageUrl(imageFilename);

  return result;
}

async function main() {
  const castles = JSON.parse(readFileSync(ENRICHED_PATH, 'utf8'));
  const withWiki = castles.filter(c => c.wikipedia_url);
  const target = DRY_RUN ? castles.slice(0, 5) : castles;

  console.log(`Input/output: ${ENRICHED_PATH}`);
  console.log(`Castles with Wikipedia URL: ${withWiki.length}`);
  console.log(`Castles to process: ${target.length}${DRY_RUN ? ' (dry-run)' : ''}`);
  console.log(`Delay between requests: ${DELAY_MS}ms\n`);

  let hits = 0;
  let misses = 0;

  const enriched = [];
  for (let i = 0; i < target.length; i++) {
    const castle = target[i];

    if (!castle.wikipedia_url) {
      process.stdout.write(`[${i + 1}/${target.length}] ${castle.castle_name} ... skipped (no Wikipedia URL)\n`);
      enriched.push(castle);
      continue;
    }

    process.stdout.write(`[${i + 1}/${target.length}] ${castle.castle_name} ... `);

    const extra = await enrichOne(castle);

    if (extra.wikidata_id) {
      hits++;
      const tags = [
        extra.architectural_style && `style: ${extra.architectural_style}`,
        extra.heritage_status && `heritage: ${extra.heritage_status}`,
        extra.inception_year && `year: ${extra.inception_year}`,
      ].filter(Boolean).join(', ');
      console.log(`${extra.wikidata_id}${tags ? ' — ' + tags : ''}`);
    } else {
      misses++;
      console.log('no QID');
    }

    enriched.push({ ...castle, ...extra });

    if (i < target.length - 1) await sleep(DELAY_MS);
  }

  // In dry-run mode keep the remaining castles unchanged
  if (DRY_RUN) {
    enriched.push(...castles.slice(5));
  }

  writeFileSync(ENRICHED_PATH, JSON.stringify(enriched, null, 2), 'utf8');

  console.log(`\nDone. Wikidata hits: ${hits}, Misses: ${misses}`);
  console.log(`Written: ${ENRICHED_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
