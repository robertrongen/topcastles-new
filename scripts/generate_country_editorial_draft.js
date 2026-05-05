#!/usr/bin/env node
/**
 * Generates a review-only draft for data/editorial/countries.json.
 *
 * The script reads castle data and the existing editor-owned overlay, then
 * suggests missing definingTradition and editorialNote fields with evidence.
 * It never writes to data/editorial/countries.json.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DEFAULT_CASTLES_PATH = path.join(ROOT, 'new_app', 'src', 'assets', 'data', 'castles.json');
const DEFAULT_OVERLAY_PATH = path.join(ROOT, 'data', 'editorial', 'countries.json');
const EDITORIAL_COUNTRIES_PATH = path.resolve(DEFAULT_OVERLAY_PATH);

const FIELD_NAMES = ['definingTradition', 'editorialNote'];

function readJsonFile(filePath, fallback = undefined) {
  if (!existsSync(filePath)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`File not found: ${filePath}`);
  }

  const text = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  return JSON.parse(text);
}

function writeJsonFile(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function countBy(rows, field) {
  const counts = new Map();
  for (const row of rows) {
    const value = cleanText(row[field]);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEra(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '';
  const suffix = value === 1 ? 'st' : value === 2 ? 'nd' : value === 3 ? 'rd' : 'th';
  return `${value}${suffix} c.`;
}

function hasEditorValue(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null;
}

function topEntries(rows, count = 3) {
  return [...rows]
    .sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0))
    .slice(0, count)
    .map(castle => ({
      code: castle.castle_code ?? '',
      name: castle.castle_name ?? '',
      scoreTotal: castle.score_total ?? 0,
      era: normalizeEra(castle.era),
      type: cleanText(castle.castle_type),
      concept: cleanText(castle.castle_concept),
    }));
}

function makeEvidence(rows) {
  return {
    castleCount: rows.length,
    topCastles: topEntries(rows, 3),
    commonTypes: countBy(rows, 'castle_type').slice(0, 3),
    commonConcepts: countBy(rows, 'castle_concept').slice(0, 3),
    commonEras: countBy(
      rows.map(row => ({ eraLabel: normalizeEra(row.era) })),
      'eraLabel'
    ).slice(0, 3),
  };
}

function chooseTradition(evidence) {
  const era = evidence.commonEras[0]?.value ?? '';
  const concept = evidence.commonConcepts[0]?.value ?? '';
  const type = evidence.commonTypes[0]?.value ?? '';

  if (era && concept) return `${era} ${concept}`;
  if (era && type) return `${era} ${type}`;
  return concept || type || era || 'Castle tradition';
}

function makeEditorialNote(country, evidence, tradition) {
  const top = evidence.topCastles[0]?.name;
  const count = evidence.castleCount;
  const traditionText = tradition.replace(/\.$/, '');

  if (count === 1 && top) {
    return `${country}'s castle entry is anchored by ${top}, a concentrated signal of ${traditionText}.`;
  }

  if (top) {
    return `${country}'s ${count}-entry catalogue is led by ${top}, with ${traditionText} as the clearest recurring thread.`;
  }

  return `${country}'s castle catalogue points most clearly toward ${traditionText}.`;
}

function buildCountryGroups(castles) {
  const groups = new Map();
  for (const castle of castles) {
    const country = cleanText(castle.country);
    if (!country) continue;
    const rows = groups.get(country) ?? [];
    rows.push(castle);
    groups.set(country, rows);
  }
  return groups;
}

function buildDraft({ castles, overlay = {}, generatedAt = new Date().toISOString() }) {
  const groups = buildCountryGroups(castles);
  const draft = {};
  const review = {};

  for (const country of [...groups.keys()].sort()) {
    const rows = groups.get(country);
    const existing = overlay[country] ?? {};
    const evidence = makeEvidence(rows);
    const suggestions = {
      definingTradition: chooseTradition(evidence),
      editorialNote: '',
    };
    suggestions.editorialNote = makeEditorialNote(country, evidence, suggestions.definingTradition);

    const missingFields = {};
    const existingFields = {};
    for (const field of FIELD_NAMES) {
      if (hasEditorValue(existing[field])) {
        existingFields[field] = existing[field];
      } else {
        missingFields[field] = suggestions[field];
      }
    }

    if (Object.keys(missingFields).length > 0) {
      draft[country] = {
        ...missingFields,
        evidence,
      };
    }

    if (Object.keys(existingFields).length > 0) {
      review[country] = {
        status: 'skipped-existing-editor-fields',
        existingFields,
        suggestedFields: suggestions,
        evidence,
      };
    }
  }

  return {
    _meta: {
      generatedAt,
      source: 'scripts/generate_country_editorial_draft.js',
      targetOverlay: 'data/editorial/countries.json',
      mode: 'draft-only',
      countriesWithDrafts: Object.keys(draft).length,
      countriesFlaggedForReview: Object.keys(review).length,
      note: 'Review draft entries before copying accepted fields into the admin editorial editor. Existing overlay fields are skipped.',
    },
    draft,
    review,
  };
}

function parseArgs(argv) {
  const options = {
    castlesPath: DEFAULT_CASTLES_PATH,
    overlayPath: DEFAULT_OVERLAY_PATH,
    outputPath: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--castles') {
      options.castlesPath = next;
      i++;
    } else if (arg === '--overlay') {
      options.overlayPath = next;
      i++;
    } else if (arg === '--output') {
      options.outputPath = next;
      i++;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function usage() {
  return [
    'Usage: node scripts/generate_country_editorial_draft.js [options]',
    '',
    'Options:',
    '  --castles <path>   Castle JSON input. Defaults to new_app/src/assets/data/castles.json',
    '  --overlay <path>   Existing countries overlay. Defaults to data/editorial/countries.json',
    '  --output <path>    Optional review artifact path. Must not be data/editorial/countries.json',
    '  --help             Show this help',
  ].join('\n');
}

function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }

  const castlesPath = path.resolve(options.castlesPath);
  const overlayPath = path.resolve(options.overlayPath);
  const outputPath = options.outputPath ? path.resolve(options.outputPath) : null;

  if (outputPath && outputPath === EDITORIAL_COUNTRIES_PATH) {
    throw new Error('Refusing to write directly to data/editorial/countries.json. Choose a separate draft output path.');
  }

  const castles = readJsonFile(castlesPath);
  const overlay = readJsonFile(overlayPath, {});

  if (!Array.isArray(castles)) {
    throw new Error('Castle input must be a JSON array.');
  }
  if (!overlay || Array.isArray(overlay) || typeof overlay !== 'object') {
    throw new Error('Overlay input must be a JSON object.');
  }

  const result = buildDraft({ castles, overlay });
  const json = `${JSON.stringify(result, null, 2)}\n`;

  process.stdout.write(json);

  if (outputPath) {
    writeJsonFile(outputPath, result);
    console.error(`[country-editorial-draft] Wrote review draft to ${path.relative(ROOT, outputPath)}`);
  }

  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = run();
  } catch (error) {
    console.error(`[country-editorial-draft] ${error.message}`);
    process.exitCode = 1;
  }
}

export { buildDraft, parseArgs, run };
