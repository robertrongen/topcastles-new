#!/usr/bin/env node
/**
 * Fills missing latitude/longitude for castles that have none.
 *
 * Strategy per castle:
 *  1. Manual override if present
 *  2. Wikidata P625 (coordinate location) via existing wikidata_id or
 *     Wikipedia URL → QID, then by searching all generated name variants.
 *  3. OpenStreetMap Nominatim geocoding using generated name variants and
 *     countrycodes filtering when available.
 *
 * Writes an unresolved report to data/pipeline/coordinate-enrichment-report.json.
 * Does not overwrite existing coordinates.
 *
 * Usage:
 *   node scripts/enrich_coordinates.js
 *   node scripts/enrich_coordinates.js --dry-run      # first 10 only
 *   node scripts/enrich_coordinates.js --delay 500    # ms between requests (default 400)
 *   node scripts/enrich_coordinates.js --nominatim-only  # skip Wikidata, only Nominatim
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const ENRICHED_PATH = join(REPO_ROOT, 'new_app', 'src', 'assets', 'data', 'castles_enriched.json');
const OVERRIDES_PATH = join(REPO_ROOT, 'scripts', 'coordinate_overrides.json');
const REPORT_PATH = join(REPO_ROOT, 'data', 'pipeline', 'coordinate-enrichment-report.json');

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

const COUNTRY_OVERRIDES = {
  'uk': 'gb',
  'united kingdom': 'gb',
  'great britain': 'gb',
  'england': 'gb',
  'scotland': 'gb',
  'wales': 'gb',
  'northern ireland': 'gb',
  'united states': 'us',
  'united states of america': 'us',
  'usa': 'us',
  'czech republic': 'cz',
  'south korea': 'kr',
  'north korea': 'kp',
  'ivory coast': 'ci',
  'russia': 'ru',
  'syrian arab republic': 'sy',
  'lao people\'s democratic republic': 'la',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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

function buildRegionNameMap() {
  const result = new Map(Object.entries(COUNTRY_OVERRIDES));
  if (typeof Intl.DisplayNames !== 'function') {
    return result;
  }

  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const isoAlpha2 = [
    'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
    'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
    'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
    'DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR',
    'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
    'HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP',
    'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
    'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
    'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
    'QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
    'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW',
  ]; 

  for (const code of isoAlpha2) {
    const name = names.of(code);
    if (typeof name === 'string' && name.trim()) {
      result.set(name.toLowerCase(), code.toLowerCase());
    }
  }
  return result;
}

const REGION_NAME_MAP = buildRegionNameMap();

export function resolveCountryCode(country) {
  if (!country || typeof country !== 'string') return null;
  const normalized = country.trim().toLowerCase();
  return REGION_NAME_MAP.get(normalized) ?? null;
}

export function generateSearchVariants(castle) {
  const rawName = (castle?.castle_name ?? '').trim();
  if (!rawName) return [];

  const variants = new Set();
  variants.add(rawName);

  const nameBeforeParen = rawName.includes('(')
    ? rawName.slice(0, rawName.indexOf('(')).trim()
    : '';
  if (nameBeforeParen) variants.add(nameBeforeParen);

  const stripped = rawName.replace(/\s*\([^)]*\)/g, '').trim();
  if (stripped && stripped !== rawName) variants.add(stripped);

  const aliasMatches = [...rawName.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim()).filter(Boolean);
  aliasMatches.forEach(alias => variants.add(alias));

  const baseNames = [rawName, nameBeforeParen, stripped, ...aliasMatches].filter(Boolean);

  for (const name of baseNames) {
    if (!/castle$/i.test(name)) variants.add(`${name} castle`);
    if (!/^castle\s/i.test(name)) variants.add(`Castle ${name}`);
  }

  if (castle?.place) {
    variants.add(`${castle.place.trim()} ${rawName}`);
  }
  if (castle?.country) {
    variants.add(`${rawName} ${castle.country.trim()}`);
  }

  return [...variants];
}

export function normalizeCoordinates(value) {
  const lat = value?.latitude ?? value?.lat;
  const lon = value?.longitude ?? value?.lon;
  if (lat == null || lon == null) return null;
  const parsedLat = Number(lat);
  const parsedLon = Number(lon);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) return null;
  return { lat: parsedLat, lon: parsedLon };
}

export function loadCoordinateOverrides(filePath = OVERRIDES_PATH) {
  if (!existsSync(filePath)) return {};
  try {
    const raw = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getOverrideCoords(castle, overrides) {
  if (!overrides || typeof overrides !== 'object') return null;
  const entry = overrides[castle.castle_code];
  if (!entry || typeof entry !== 'object') return null;
  return normalizeCoordinates(entry);
}

export function castleHasCoordinates(castle) {
  return castle?.latitude != null && castle?.longitude != null;
}

async function searchWikidataCandidates(query) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=10&type=item`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.search ?? [];
}

async function fetchWikidataEntities(qids) {
  if (!qids.length) return {};
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(qids.join('|'))}&props=claims&format=json&formatversion=2`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.entities ?? {};
}

export async function searchWikidataVariants(variants, triedQueries = []) {
  for (const variant of variants) {
    triedQueries.push(`wikidata:${variant}`);
    const candidates = await searchWikidataCandidates(variant);
    if (!candidates.length) continue;

    const candidateIds = candidates.map(item => item.id).filter(Boolean);
    if (!candidateIds.length) continue;
    const entities = await fetchWikidataEntities(candidateIds);

    for (const candidate of candidates) {
      const entity = entities[candidate.id];
      const claim = entity?.claims?.P625?.[0];
      const val = claim?.mainsnak?.datavalue?.value;
      if (val?.latitude != null && val?.longitude != null) {
        return { lat: val.latitude, lon: val.longitude, _qid: candidate.id };
      }
    }
    await sleep(DELAY_MS);
  }
  return null;
}

export async function nominatimVariants(variants, countryCode, triedQueries = []) {
  for (const variant of variants) {
    triedQueries.push(`nominatim:${variant}`);
    const coords = await nominatimCoords(variant, countryCode);
    if (coords) return coords;
    await sleep(DELAY_MS);
  }
  return null;
}

async function nominatimCoords(name, countryCode) {
  const q = encodeURIComponent(name);
  const countryParam = countryCode ? `&countrycodes=${countryCode}` : '';
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&featuretype=historic${countryParam}`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.[0];
  if (!hit) return null;
  return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) };
}

export async function getCoords(castle, options = {}) {
  if (castleHasCoordinates(castle)) return null;

  const overrides = options.overrides ?? {};
  const delayMs = options.delayMs ?? DELAY_MS;
  const nominatimOnly = options.nominatimOnly ?? NOMINATIM_ONLY;
  const triedQueries = [];

  const overrideCoordinates = getOverrideCoords(castle, overrides);
  if (overrideCoordinates) {
    return { ...overrideCoordinates, _method: 'override', triedQueries };
  }

  if (nominatimOnly) {
    const countryCode = resolveCountryCode(castle.country);
    const coords = await nominatimVariants(generateSearchVariants(castle), countryCode, triedQueries);
    return coords ? { ...coords, _method: 'nominatim', triedQueries } : { triedQueries };
  }

  let qid = castle.wikidata_id ?? null;
  if (!qid && castle.wikipedia_url) {
    qid = await resolveQid(castle.wikipedia_url);
    triedQueries.push(`wikipedia:${castle.wikipedia_url}`);
    await sleep(delayMs);
  }

  if (qid) {
    const coords = await wikidataCoords(qid);
    if (coords) return { ...coords, _method: 'wikidata', _qid: qid, triedQueries };
    await sleep(delayMs);
  }

  const variants = generateSearchVariants(castle);
  const wdCoords = await searchWikidataVariants(variants, triedQueries);
  if (wdCoords) return { ...wdCoords, _method: 'wikidata', triedQueries };

  const countryCode = resolveCountryCode(castle.country);
  const nomiCoords = await nominatimVariants(variants, countryCode, triedQueries);
  return nomiCoords ? { ...nomiCoords, _method: 'nominatim', triedQueries } : { triedQueries };
}

function writeReport(entries) {
  mkdirSync(join(REPO_ROOT, 'data', 'pipeline'), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(entries, null, 2), 'utf8');
}

async function main() {
  const castles = JSON.parse(readFileSync(ENRICHED_PATH, 'utf8'));
  const overrides = loadCoordinateOverrides();
  const missing = castles.filter(c => c.latitude == null || c.longitude == null);
  const target = DRY_RUN ? missing.slice(0, 10) : missing;

  console.log(`Total castles: ${castles.length}`);
  console.log(`Missing coords: ${missing.length}`);
  console.log(`To process: ${target.length}${DRY_RUN ? ' (dry-run)' : ''}`);
  console.log(`Delay: ${DELAY_MS}ms | Strategy: ${NOMINATIM_ONLY ? 'Nominatim only' : 'Wikidata P625 → variants → Nominatim'}\n`);

  const byCode = new Map(castles.map(c => [c.castle_code, { ...c }]));
  const unresolved = [];
  let wdHits = 0, nomHits = 0, overrideHits = 0, misses = 0;

  for (let i = 0; i < target.length; i++) {
    const castle = target[i];
    process.stdout.write(`[${i + 1}/${target.length}] ${castle.castle_name} ... `);

    const result = await getCoords(castle, { overrides, delayMs: DELAY_MS, nominatimOnly: NOMINATIM_ONLY });
    const coords = result && result.lat != null && result.lon != null ? result : null;

    if (coords) {
      const existing = byCode.get(castle.castle_code);
      byCode.set(castle.castle_code, {
        ...existing,
        latitude:  Math.round(coords.lat * 1e6) / 1e6,
        longitude: Math.round(coords.lon * 1e6) / 1e6,
      });
      if (coords._method === 'wikidata') wdHits++;
      else if (coords._method === 'nominatim') nomHits++;
      else if (coords._method === 'override') overrideHits++;
      console.log(`${coords._method} → ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
    } else {
      misses++;
      unresolved.push({
        castle_code: castle.castle_code,
        castle_name: castle.castle_name,
        country: castle.country,
        place: castle.place,
        triedQueries: result?.triedQueries ?? [],
      });
      console.log('not found');
    }

    if (i < target.length - 1) await sleep(DELAY_MS);
  }

  const enriched = castles.map(c => byCode.get(c.castle_code));
  if (!DRY_RUN) {
    writeFileSync(ENRICHED_PATH, JSON.stringify(enriched, null, 2), 'utf8');
    writeReport(unresolved);
    console.log(`\nDone.`);
    console.log(`  Wikidata hits: ${wdHits}`);
    console.log(`  Nominatim hits: ${nomHits}`);
    console.log(`  Override hits: ${overrideHits}`);
    console.log(`  Not found: ${misses}`);
    console.log(`Written: ${ENRICHED_PATH}`);
    console.log(`Report: ${REPORT_PATH}`);
  } else {
    console.log(`\nDry run complete, no files were written.`);
    console.log(`  Wikidata hits: ${wdHits}`);
    console.log(`  Nominatim hits: ${nomHits}`);
    console.log(`  Override hits: ${overrideHits}`);
    console.log(`  Not found: ${misses}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exit(1); });
}

