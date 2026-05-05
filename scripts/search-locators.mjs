#!/usr/bin/env node
/**
 * Search Wikimedia Commons for locator map candidates for each unresolved
 * manifest entry and store results in the `candidates` array.
 *
 * Usage:
 *   npm run locators:search                   # all unresolved, max 5 candidates each
 *   npm run locators:search -- --limit=20     # process at most 20 regions
 *   npm run locators:search -- --force        # re-search entries that already have candidates
 *   npm run locators:search -- --dry-run      # print queries without touching the manifest
 *   npm run locators:search -- --region=alsace  # target a single region
 */
import {
  MANIFEST_PATH,
  readJson,
  writeJson,
  clean,
} from './region-locators.mjs';

const args = process.argv.slice(2);
const force   = args.includes('--force');
const dryRun  = args.includes('--dry-run');
const limitArg  = args.find(a => a.startsWith('--limit='));
const limit     = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
const regionArg = args.find(a => a.startsWith('--region='));
const onlyRegion = regionArg ? regionArg.split('=')[1] : null;

const CANDIDATES_PER_REGION = 5;
const DELAY_MS = 600;
const UA = process.env.WIKIMEDIA_USER_AGENT
  || 'TopcastlesLocatorSearcher/1.0 (https://topcastles.com; contact: configure WIKIMEDIA_USER_AGENT)';

const manifest = await readJson(MANIFEST_PATH, {});

const targets = Object.entries(manifest).filter(([code, entry]) => {
  if (onlyRegion && code !== onlyRegion) return false;
  if (clean(entry.commons)) return false;                     // already resolved
  if (!force && entry.candidates?.length > 0) return false;  // already searched
  return true;
}).slice(0, Number.isFinite(limit) ? limit : undefined);

if (targets.length === 0) {
  console.log('[locators:search] Nothing to search. Use --force to re-search existing candidates.');
  process.exit(0);
}

console.log(`[locators:search] Searching ${targets.length} regions…`);

let updated = 0;
for (const [regionCode, entry] of targets) {
  const queries = buildQueries(regionCode, entry);
  const seen = new Set();
  const candidates = [];

  for (const query of queries) {
    if (candidates.length >= CANDIDATES_PER_REGION) break;
    if (dryRun) {
      console.log(`[locators:search] ${regionCode}: would query "${query}"`);
      continue;
    }

    const results = await searchCommons(query);
    for (const title of results) {
      const filename = title.replace(/^File:/, '');
      if (!seen.has(filename)) {
        seen.add(filename);
        candidates.push(filename);
      }
      if (candidates.length >= CANDIDATES_PER_REGION) break;
    }

    await sleep(DELAY_MS);
  }

  if (dryRun) continue;

  manifest[regionCode].candidates = candidates;
  updated++;

  const preview = candidates.length
    ? candidates.map(c => `  • ${c}`).join('\n')
    : '  (none found)';
  console.log(`[locators:search] ${regionCode} (${entry.countries?.[0] ?? '?'}): ${candidates.length} candidate(s)\n${preview}`);
}

if (!dryRun && updated > 0) {
  await writeJson(MANIFEST_PATH, manifest);
  console.log(`\n[locators:search] Saved ${updated} updated entries to manifest.`);
}

// ---------------------------------------------------------------------------

function buildQueries(regionCode, entry) {
  const regionName = entry.regions?.[0] ?? regionCode;
  const country    = entry.countries?.[0] ?? '';

  // Normalise: strip parentheticals like "Elzas (Alsace)" → try both
  const bare = regionName.replace(/\s*\(.*?\)\s*/g, '').trim();
  const inParens = (regionName.match(/\(([^)]+)\)/) ?? [])[1] ?? '';

  const names = [...new Set([bare, inParens, regionCode].filter(Boolean))];
  const queries = [];

  for (const name of names) {
    if (country) {
      queries.push(`${name} locator map ${country} filetype:svg`);
      queries.push(`${name} location map ${country} filetype:svg`);
      queries.push(`${name} ${country} locator filetype:svg`);
    }
    queries.push(`${name} locator map filetype:svg`);
    queries.push(`${name} location map filetype:svg`);
    // PNG fallback
    if (country) queries.push(`${name} locator map ${country} filetype:png`);
  }

  return queries;
}

async function searchCommons(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'search');
  url.searchParams.set('srsearch', query);
  url.searchParams.set('srnamespace', '6');   // File namespace
  url.searchParams.set('srlimit', String(CANDIDATES_PER_REGION + 2));
  url.searchParams.set('srinfo', '');
  url.searchParams.set('srprop', 'titlesnippet');
  url.searchParams.set('format', 'json');

  try {
    const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.query?.search ?? []).map(r => r.title);
  } catch {
    return [];
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
