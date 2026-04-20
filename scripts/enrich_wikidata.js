#!/usr/bin/env node
/**
 * Enriches castles_enriched.json with Wikidata structured data.
 *
 * For each castle that has a wikipedia_url (or existing wikidata_id) it
 * resolves the Wikidata QID via the MediaWiki action API, then fetches
 * selected claims from Wikidata:
 *   P149  → architectural_style  (label string)
 *   P1435 → heritage_status      (label string, e.g. "UNESCO World Heritage Site")
 *   P571  → inception_year       (year integer)
 *   P18   → wikidata_image       (Wikimedia Commons filename → usable URL)
 *   P112  → wikidata_founder     (founded-by label; copied to founder if founder is blank)
 *   P84   → architect            (architect label)
 *   P856  → wikidata_website     (official URL; copied to website if website is blank)
 *   P793  → significant_events   (array of event labels)
 *
 * Writes new_app/src/assets/data/castles_enriched.json in-place.
 *
 * Usage:
 *   node scripts/enrich_wikidata.js
 *   node scripts/enrich_wikidata.js --dry-run        # process first 5 only
 *   node scripts/enrich_wikidata.js --delay 400      # ms between requests (default 300)
 *   node scripts/enrich_wikidata.js --refill         # only castles missing any new field
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const ENRICHED_PATH = join(REPO_ROOT, 'new_app', 'src', 'assets', 'data', 'castles_enriched.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const REFILL  = args.includes('--refill');
const DELAY_MS = (() => {
  const idx = args.indexOf('--delay');
  return idx !== -1 ? parseInt(args[idx + 1], 10) : 300;
})();

const HEADERS = { 'User-Agent': 'TopCastles-enrichment/1.0 (rongen.robert@gmail.com)' };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Resolve Wikipedia page title → Wikidata QID. */
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

/** Fetch all claims + labels for a QID. */
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

/** Resolve multiple QIDs to labels in one API call (up to ~50). */
async function resolveLabels(qids) {
  if (!qids.length) return {};
  const ids = [...new Set(qids)].join('|');
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(ids)}&props=labels&languages=en&format=json&formatversion=2`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return {};
  const data = await res.json();
  const out = {};
  for (const qid of qids) {
    out[qid] = data?.entities?.[qid]?.labels?.en?.value ?? null;
  }
  return out;
}

/** First item QID for a property. */
function firstItemQid(entity, prop) {
  return entity?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value?.id ?? null;
}

/** All item QIDs for a property. */
function allItemQids(entity, prop) {
  const claims = entity?.claims?.[prop] ?? [];
  return claims
    .map(c => c?.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);
}

/** First string value for a property. */
function firstString(entity, prop) {
  return entity?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value ?? null;
}

/** Build a usable Wikimedia Commons image URL from a filename. */
function commonsImageUrl(filename) {
  if (!filename) return null;
  const clean = filename.replace(/ /g, '_');
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=800`;
}

/** True if castle is missing any of the fields we write. */
function needsRefill(castle) {
  return !castle.wikidata_id
    || castle.architectural_style == null
    || castle.heritage_status == null
    || castle.inception_year == null
    || castle.wikidata_founder == null
    || castle.architect == null
    || castle.significant_events == null;
}

async function enrichOne(castle) {
  // Prefer already-stored wikidata_id to skip the Wikipedia API round-trip
  let qid = castle.wikidata_id ?? null;
  if (!qid && castle.wikipedia_url) {
    qid = await resolveQid(castle.wikipedia_url);
    if (qid) await sleep(150);
  }
  if (!qid) return {};

  const entity = await fetchClaims(qid);
  if (!entity) return { wikidata_id: qid };

  const result = { wikidata_id: qid };

  // --- collect all item QIDs we need to resolve in one batch ---
  const toResolve = {};

  const styleQid    = firstItemQid(entity, 'P149');
  const heritageQid = firstItemQid(entity, 'P1435');
  const founderQid  = firstItemQid(entity, 'P112');
  const architectQid = firstItemQid(entity, 'P84');
  const eventQids   = allItemQids(entity, 'P793');

  const batchQids = [styleQid, heritageQid, founderQid, architectQid, ...eventQids].filter(Boolean);

  let labels = {};
  if (batchQids.length) {
    await sleep(100);
    // Wikidata allows up to 50 IDs per request
    for (let i = 0; i < batchQids.length; i += 50) {
      const chunk = batchQids.slice(i, i + 50);
      const partial = await resolveLabels(chunk);
      Object.assign(labels, partial);
      if (i + 50 < batchQids.length) await sleep(100);
    }
  }

  // P149 — architectural style
  if (styleQid) result.architectural_style = labels[styleQid] ?? null;

  // P1435 — heritage designation
  if (heritageQid) result.heritage_status = labels[heritageQid] ?? null;

  // P571 — inception year
  const inceptionVal = entity?.claims?.P571?.[0]?.mainsnak?.datavalue?.value;
  if (inceptionVal?.time) {
    const year = parseInt(inceptionVal.time.replace(/^[+-]/, '').slice(0, 4), 10);
    if (!isNaN(year) && year > 0) result.inception_year = year;
  }

  // P18 — image
  const imageFilename = firstString(entity, 'P18');
  if (imageFilename) result.wikidata_image = commonsImageUrl(imageFilename);

  // P112 — founded by
  if (founderQid) result.wikidata_founder = labels[founderQid] ?? null;

  // P84 — architect
  if (architectQid) result.architect = labels[architectQid] ?? null;

  // P856 — official website (string URL, not item)
  const officialSite = firstString(entity, 'P856');
  if (officialSite) result.wikidata_website = officialSite;

  // P793 — significant events (array of labels)
  if (eventQids.length) {
    result.significant_events = eventQids
      .map(q => labels[q])
      .filter(Boolean);
  }

  return result;
}

async function main() {
  const castles = JSON.parse(readFileSync(ENRICHED_PATH, 'utf8'));

  let target = castles.filter(c => c.wikipedia_url || c.wikidata_id);
  if (REFILL)   target = target.filter(needsRefill);
  if (DRY_RUN)  target = target.slice(0, 5);

  console.log(`Input/output: ${ENRICHED_PATH}`);
  console.log(`Castles with Wikipedia/Wikidata: ${castles.filter(c => c.wikipedia_url || c.wikidata_id).length}`);
  console.log(`To process: ${target.length}${DRY_RUN ? ' (dry-run)' : ''}${REFILL ? ' (refill missing)' : ''}`);
  console.log(`Delay between requests: ${DELAY_MS}ms\n`);

  const byCode = new Map(castles.map(c => [c.castle_code, { ...c }]));
  let hits = 0, misses = 0;

  for (let i = 0; i < target.length; i++) {
    const castle = target[i];
    process.stdout.write(`[${i + 1}/${target.length}] ${castle.castle_name} ... `);

    const extra = await enrichOne(castle);

    if (extra.wikidata_id) {
      hits++;
      const existing = byCode.get(castle.castle_code);

      // Copy wikidata_founder → founder where founder is blank
      const founderFill = extra.wikidata_founder && !existing.founder
        ? { founder: extra.wikidata_founder }
        : {};

      // Copy wikidata_website → website where website is blank
      const websiteFill = extra.wikidata_website && !existing.website
        ? { website: extra.wikidata_website }
        : {};

      byCode.set(castle.castle_code, {
        ...existing,
        ...extra,
        ...founderFill,
        ...websiteFill,
      });

      const tags = [
        extra.wikidata_founder && `founder: ${extra.wikidata_founder}`,
        extra.architect        && `architect: ${extra.architect}`,
        extra.wikidata_website && `website: ✓`,
        extra.significant_events?.length && `events: ${extra.significant_events.length}`,
      ].filter(Boolean).join(', ');
      console.log(`${extra.wikidata_id}${tags ? ' — ' + tags : ''}`);
    } else {
      misses++;
      console.log('no QID');
    }

    if (i < target.length - 1) await sleep(DELAY_MS);
  }

  const enriched = castles.map(c => byCode.get(c.castle_code));
  writeFileSync(ENRICHED_PATH, JSON.stringify(enriched, null, 2), 'utf8');

  console.log(`\nDone. Wikidata hits: ${hits}, Misses: ${misses}`);
  console.log(`Written: ${ENRICHED_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
