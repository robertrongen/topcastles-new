#!/usr/bin/env node
/**
 * Enriches castles.json with Wikipedia data.
 *
 * Lookup strategy per castle (stops at first hit):
 *  1. Full castle_name via REST summary API
 *  2. Stripped name (parenthetical removed) via REST summary API
 *  3. "{stripped} castle" via REST summary API
 *  4. Wikipedia search API (srsearch) — handles non-English / alternate spellings
 *     Top result is accepted if its title/extract contains a castle-related keyword.
 *
 * Writes new_app/src/assets/data/castles_enriched.json — the original JSON
 * plus three optional fields per castle:
 *   wikipedia_extract    : string  — first paragraph from Wikipedia
 *   wikipedia_thumbnail  : string  — URL of page thumbnail image
 *   wikipedia_url        : string  — canonical desktop URL
 *
 * Usage:
 *   node scripts/enrich_wikipedia.js
 *   node scripts/enrich_wikipedia.js --dry-run        # process first 5 only
 *   node scripts/enrich_wikipedia.js --delay 600      # ms between requests (default 300)
 *   node scripts/enrich_wikipedia.js --misses-only    # re-run only castles without a wikipedia_url
 */

import { readFileSync, writeFileSync } from 'fs';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const INPUT_PATH  = join(REPO_ROOT, 'new_app', 'src', 'assets', 'data', 'castles.json');
const OUTPUT_PATH = join(REPO_ROOT, 'new_app', 'src', 'assets', 'data', 'castles_enriched.json');

const args = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const MISSES_ONLY = args.includes('--misses-only');
const DELAY_MS = (() => {
  const idx = args.indexOf('--delay');
  return idx !== -1 ? parseInt(args[idx + 1], 10) : 300;
})();

const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const WIKI_SEARCH  = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&formatversion=2&srsearch=';
const HEADERS = { 'User-Agent': 'TopCastles-enrichment/1.0 (rongen.robert@gmail.com)' };

// Keywords that indicate a search result is actually about a castle/fortress
const CASTLE_KEYWORDS = [
  'castle', 'château', 'chateau', 'fortress', 'fortification', 'citadel',
  'stronghold', 'keep', 'donjon', 'tower', 'burg', 'schloss', 'fort',
  'palace', 'manor', 'ruin', 'medieval', 'rampart', 'battlement',
];

// Title categories that indicate a non-castle false positive
const FALSE_POSITIVE_TITLE_PATTERNS = [
  /\bautomobile\b/i, /\bcar\b/i, /\bvehicle\b/i, /\bmotorcycle\b/i,
  /\bfilm\b/i, /\bmovie\b/i, /\bsong\b/i, /\bband\b/i, /\balbum\b/i,
  /\bperson\b/i, /\bpolitician\b/i, /\bfootballer\b/i,
];

function isCastleResult(title, extract) {
  const hay = `${title} ${extract ?? ''}`.toLowerCase();
  // Reject obvious non-castle false positives based on extract content
  if (FALSE_POSITIVE_TITLE_PATTERNS.some(re => re.test(extract ?? ''))) return false;
  return CASTLE_KEYWORDS.some(kw => hay.includes(kw));
}

async function fetchSummary(title) {
  const url = WIKI_SUMMARY + encodeURIComponent(title);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type === 'disambiguation') return null;
  if (data.type?.includes('not_found')) return null;
  return data;
}

async function searchWikipedia(query) {
  const url = WIKI_SEARCH + encodeURIComponent(query);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.query?.search?.[0];
  if (!hit) return null;

  // Fetch the actual summary for the top search result
  const summary = await fetchSummary(hit.title);
  if (!summary) return null;

  // Reject if the result doesn't look like a castle page
  if (!isCastleResult(summary.title, summary.extract)) return null;

  return summary;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Derive a list of candidate direct-lookup titles from a castle name. */
function candidateTitles(castle) {
  const name = castle.castle_name;
  const candidates = [name];

  // Strip parenthetical: "Krak des Chevaliers (Kalat el Hösn)" → "Krak des Chevaliers"
  const stripped = name.replace(/\s*\(.*\)/, '').trim();
  if (stripped !== name) candidates.push(stripped);

  // Append "castle" if not already in name
  const lower = stripped.toLowerCase();
  if (!lower.includes('castle') && !lower.includes('château') && !lower.includes('fortress')
      && !lower.includes('burg') && !lower.includes('schloss')) {
    candidates.push(`${stripped} castle`);
  }

  return [...new Set(candidates)];
}

async function enrich(castle) {
  // Steps 1–3: direct title lookups
  for (const title of candidateTitles(castle)) {
    const data = await fetchSummary(title);
    if (!data) continue;
    return summaryToFields(data, 'direct');
  }

  // Step 4: Wikipedia search API fallback
  const stripped = castle.castle_name.replace(/\s*\(.*\)/, '').trim();
  const data = await searchWikipedia(stripped);
  if (data) return summaryToFields(data, 'search');

  return {};
}

function summaryToFields(data, method) {
  return {
    wikipedia_extract:   data.extract             ?? null,
    wikipedia_thumbnail: data.thumbnail?.source   ?? null,
    wikipedia_url:       data.content_urls?.desktop?.page ?? null,
    _wikipedia_method:   method,   // temporary debug field, stripped on write
  };
}

async function main() {
  // Use enriched file as base if it exists and --misses-only is set
  const basePath = (MISSES_ONLY && existsSync(OUTPUT_PATH)) ? OUTPUT_PATH : INPUT_PATH;
  const castles = JSON.parse(readFileSync(basePath, 'utf8'));

  let target = DRY_RUN ? castles.slice(0, 5) : castles;
  if (MISSES_ONLY) target = target.filter(c => !c.wikipedia_url);

  console.log(`Base:   ${basePath}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log(`Castles to process: ${target.length}${DRY_RUN ? ' (dry-run)' : ''}${MISSES_ONLY ? ' (misses-only)' : ''}`);
  console.log(`Delay between requests: ${DELAY_MS}ms\n`);

  const byCode = new Map(castles.map(c => [c.castle_code, c]));
  let hits = 0, misses = 0, searchHits = 0;

  for (let i = 0; i < target.length; i++) {
    const castle = target[i];
    process.stdout.write(`[${i + 1}/${target.length}] ${castle.castle_name} ... `);

    const extra = await enrich(castle);

    if (extra.wikipedia_url) {
      const viaSearch = extra._wikipedia_method === 'search';
      hits++;
      if (viaSearch) searchHits++;
      console.log(`${viaSearch ? 'search→ ' : 'OK '}— ${extra.wikipedia_url}`);
    } else {
      misses++;
      console.log('not found');
    }

    delete extra._wikipedia_method;
    byCode.set(castle.castle_code, { ...byCode.get(castle.castle_code), ...extra });

    if (i < target.length - 1) await sleep(DELAY_MS);
  }

  const enriched = castles.map(c => byCode.get(c.castle_code));
  writeFileSync(OUTPUT_PATH, JSON.stringify(enriched, null, 2), 'utf8');

  console.log(`\nDone. Hits: ${hits} (${searchHits} via search), Misses: ${misses}`);
  console.log(`Written: ${OUTPUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
