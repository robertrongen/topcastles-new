#!/usr/bin/env node

import { spawnSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildDraft } from './generate_country_editorial_draft.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, 'generate_country_editorial_draft.js');

const CASTLES = [
  {
    castle_code: 'krak',
    castle_name: 'Krak des Chevaliers',
    country: 'Syria',
    era: 12,
    castle_type: 'Rock castle',
    castle_concept: 'Donjon inside curtain wall',
    score_total: 1153,
  },
  {
    castle_code: 'margat',
    castle_name: 'Margat',
    country: 'Syria',
    era: 12,
    castle_type: 'Rock castle',
    castle_concept: 'Donjon inside curtain wall',
    score_total: 546,
  },
  {
    castle_code: 'tower',
    castle_name: 'Tower of London',
    country: 'England',
    era: 11,
    castle_type: 'City castle',
    castle_concept: 'Donjon inside curtain wall',
    score_total: 1278,
  },
  {
    castle_code: 'dover',
    castle_name: 'Dover Castle',
    country: 'England',
    era: 12,
    castle_type: 'City castle',
    castle_concept: 'Donjon inside curtain wall',
    score_total: 980,
  },
];

function makeTempFile(name, data) {
  const dir = mkdtempSync(path.join(tmpdir(), 'country-editorial-draft-'));
  const filePath = path.join(dir, name);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return { dir, filePath };
}

function runScript(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf-8',
  });
}

describe('generate_country_editorial_draft', () => {
  it('drafts missing fields with castle-data evidence', () => {
    const result = buildDraft({
      castles: CASTLES,
      overlay: {},
      generatedAt: '2026-05-05T00:00:00.000Z',
    });

    assert.equal(result._meta.mode, 'draft-only');
    assert.equal(result._meta.countriesWithDrafts, 2);
    assert.equal(result.draft.Syria.definingTradition, '12th c. Donjon inside curtain wall');
    assert.match(result.draft.Syria.editorialNote, /Krak des Chevaliers/);
    assert.deepEqual(result.draft.Syria.evidence.commonTypes[0], {
      value: 'Rock castle',
      count: 2,
    });
    assert.equal(result.draft.England.evidence.topCastles[0].code, 'tower');
  });

  it('skips existing editor-owned fields and flags them for review', () => {
    const result = buildDraft({
      castles: CASTLES,
      overlay: {
        Syria: {
          editorialNote: 'Existing editor sentence.',
          definingTradition: 'Existing tradition',
        },
        England: {
          definingTradition: 'Norman city castles',
        },
      },
      generatedAt: '2026-05-05T00:00:00.000Z',
    });

    assert.equal(result.draft.Syria, undefined);
    assert.equal(result.review.Syria.status, 'skipped-existing-editor-fields');
    assert.equal(result.review.Syria.existingFields.editorialNote, 'Existing editor sentence.');
    assert.equal(result.draft.England.definingTradition, undefined);
    assert.match(result.draft.England.editorialNote, /Tower of London/);
    assert.equal(result.review.England.existingFields.definingTradition, 'Norman city castles');
  });

  it('prints review JSON to stdout without writing by default', () => {
    const castles = makeTempFile('castles.json', CASTLES);
    const overlay = makeTempFile('countries.json', {});

    const result = runScript(['--castles', castles.filePath, '--overlay', overlay.filePath]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    const parsed = JSON.parse(result.stdout);
    assert.ok(parsed.draft.Syria);
  });

  it('writes only to an explicit draft artifact path', () => {
    const castles = makeTempFile('castles.json', CASTLES);
    const overlay = makeTempFile('countries.json', {});
    const outputPath = path.join(castles.dir, 'countries-draft.json');

    const result = runScript([
      '--castles', castles.filePath,
      '--overlay', overlay.filePath,
      '--output', outputPath,
    ]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /Wrote review draft/);
    const parsed = JSON.parse(readFileSync(outputPath, 'utf-8'));
    assert.ok(parsed.draft.England);
  });

  it('refuses to write directly to the editor-owned countries overlay', () => {
    const castles = makeTempFile('castles.json', CASTLES);
    const overlay = makeTempFile('countries.json', {});
    const repoOverlay = path.resolve(__dirname, '..', 'data', 'editorial', 'countries.json');

    const result = runScript([
      '--castles', castles.filePath,
      '--overlay', overlay.filePath,
      '--output', repoOverlay,
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Refusing to write directly/);
  });
});
