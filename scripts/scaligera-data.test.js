import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(scriptsDir, '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), 'utf8'));
}

function getScaligera(castles) {
  const castle = castles.find((item) => item.castle_code === 'scaligera');
  assert.ok(castle, 'scaligera record should exist');
  return castle;
}

for (const file of [
  'new_app/src/assets/data/castles.json',
  'new_app/src/assets/data/castles_enriched.json',
  'new_app/public/api/castles.json',
  'new_app/public/api/top100.json',
  'new_app/public/api/by-country/italy.json',
]) {
  const castle = getScaligera(await readJson(file));

  assert.equal(castle.castle_name, 'Rocca Scaligera', file);
  assert.equal(castle.place, 'Sirmione', file);
  if (file.endsWith('castles_enriched.json')) {
    assert.equal(castle.wikidata_id, 'Q3662370', file);
    assert.equal(castle.wikipedia_url, 'https://en.wikipedia.org/wiki/Scaligero_Castle_(Sirmione)', file);
  }
  assert.doesNotMatch(JSON.stringify(castle), /Roccascalegna|Rocca_scalegna|Q51276/, file);
}