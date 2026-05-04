#!/usr/bin/env node
/**
 * Integration tests for apply_castle_overrides.js.
 * Uses Node built-in test runner: node --test apply_castle_overrides.test.js
 *
 * Strategy: for each test, write a temp enriched JSON + optional overrides JSON,
 * set env vars, spawn the script as a child process, assert outputs and file state.
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, 'apply_castle_overrides.js');

const ENRICHED_BASE = [
  {
    castle_code: 'krak-des-chevaliers',
    castle_name: 'Krak des Chevaliers',
    country: 'Syria',
    place: 'Al-Hosn',
    position: 1,
    score_total: 950,
    score_visitors: 8,
    visitors: 35000,
  },
  {
    castle_code: 'eilean-donan',
    castle_name: 'Eilean Donan Castle',
    country: 'Scotland',
    place: 'Dornie',
    position: 2,
    score_total: 910,
    score_visitors: 9,
    visitors: 310000,
  },
];

function makeTemp() {
  const dir = mkdtempSync(path.join(tmpdir(), 'merge-overrides-test-'));
  const pipelineDir = path.join(dir, 'pipeline');
  mkdirSync(pipelineDir, { recursive: true });
  return { dir, pipelineDir };
}

function writeEnriched(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function writeOverrides(pipelineDir, data) {
  writeFileSync(path.join(pipelineDir, 'castle-overrides.json'), JSON.stringify(data, null, 2), 'utf-8');
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function runScript(enrichedPath, dataDir) {
  return spawnSync(process.execPath, [SCRIPT], {
    env: {
      ...process.env,
      CASTLES_ENRICHED_PATH: enrichedPath,
      DATA_DIR: dataDir,
    },
    encoding: 'utf-8',
  });
}

describe('apply_castle_overrides', () => {

  describe('no overrides file', () => {
    it('exits 0 and logs skip message when castle-overrides.json is absent', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);

      const result = runScript(enrichedPath, dir);

      assert.equal(result.status, 0);
      assert.ok(result.stdout.includes('No castle-overrides.json found'), result.stdout);
      // enriched file not modified
      const after = readJson(enrichedPath);
      assert.equal(after.length, 2);
    });
  });

  describe('empty overrides', () => {
    it('exits 0 and logs empty message when overrides object is {}', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {});

      const result = runScript(enrichedPath, dir);

      assert.equal(result.status, 0);
      assert.ok(result.stdout.includes('empty'), result.stdout);
    });
  });

  describe('existing castle override', () => {
    it('override fields win over enriched fields', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {
        'krak-des-chevaliers': { castle_name: 'Krak des Chevaliers (corrected)', score_total: 960 },
      });

      const result = runScript(enrichedPath, dir);

      assert.equal(result.status, 0, result.stderr);
      const after = readJson(enrichedPath);
      const krak = after.find(c => c.castle_code === 'krak-des-chevaliers');
      assert.equal(krak.castle_name, 'Krak des Chevaliers (corrected)');
      assert.equal(krak.score_total, 960);
      // other fields preserved
      assert.equal(krak.country, 'Syria');
      assert.equal(krak.position, 1);
    });

    it('does not affect unrelated records', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {
        'krak-des-chevaliers': { castle_name: 'Updated name' },
      });

      runScript(enrichedPath, dir);

      const after = readJson(enrichedPath);
      const eilean = after.find(c => c.castle_code === 'eilean-donan');
      assert.equal(eilean.castle_name, 'Eilean Donan Castle');
      assert.equal(eilean.position, 2);
    });

    it('logs applied code in stdout', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {
        'eilean-donan': { visitors: 350000 },
      });

      const result = runScript(enrichedPath, dir);

      assert.ok(result.stdout.includes('eilean-donan'), result.stdout);
    });
  });

  describe('new castle draft', () => {
    it('appends new castle with position = maxPosition + 1', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {
        'new-draft-castle': {
          castle_name: 'New Draft Castle',
          country: 'France',
          place: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
        },
      });

      const result = runScript(enrichedPath, dir);

      assert.equal(result.status, 0, result.stderr);
      const after = readJson(enrichedPath);
      assert.equal(after.length, 3);
      const draft = after.find(c => c.castle_code === 'new-draft-castle');
      assert.ok(draft, 'draft castle should be in enriched');
      assert.equal(draft.position, 3); // maxPosition was 2
      assert.equal(draft.castle_name, 'New Draft Castle');
      assert.equal(draft.score_total, 0);
      assert.equal(draft.score_visitors, 0);
      assert.equal(draft.visitors, 0);
    });

    it('assigns sequential positions when multiple new castles added', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {
        'draft-a': { castle_name: 'Draft A', country: 'France', place: 'Lyon', latitude: 45.7, longitude: 4.8 },
        'draft-b': { castle_name: 'Draft B', country: 'France', place: 'Nice', latitude: 43.7, longitude: 7.2 },
      });

      runScript(enrichedPath, dir);

      const after = readJson(enrichedPath);
      const a = after.find(c => c.castle_code === 'draft-a');
      const b = after.find(c => c.castle_code === 'draft-b');
      assert.ok(a && b);
      // positions should be 3 and 4 (order may depend on object key order, but both ≥ 3 and distinct)
      const positions = new Set([a.position, b.position]);
      assert.equal(positions.size, 2);
      assert.ok(a.position >= 3);
      assert.ok(b.position >= 3);
    });

    it('logs added code in stdout', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {
        'fresh-castle': { castle_name: 'Fresh Castle', country: 'Italy', place: 'Rome', latitude: 41.9, longitude: 12.5 },
      });

      const result = runScript(enrichedPath, dir);

      assert.ok(result.stdout.includes('fresh-castle'), result.stdout);
    });
  });

  describe('merge report', () => {
    it('writes merge-report.json with correct counts', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);
      writeOverrides(pipelineDir, {
        'krak-des-chevaliers': { score_total: 955 },
        'new-draft': { castle_name: 'New Draft', country: 'Spain', place: 'Madrid', latitude: 40.4, longitude: -3.7 },
      });

      runScript(enrichedPath, dir);

      const reportPath = path.join(pipelineDir, 'merge-report.json');
      assert.ok(existsSync(reportPath), 'merge-report.json should exist');
      const report = readJson(reportPath);
      assert.equal(report.overridesApplied, 1);
      assert.equal(report.newCastlesAdded, 1);
      assert.deepEqual(report.applied, ['krak-des-chevaliers']);
      assert.deepEqual(report.added, ['new-draft']);
      assert.ok(report.appliedAt, 'appliedAt should be set');
    });

    it('does not write merge-report.json when overrides file is absent', () => {
      const { dir, pipelineDir } = makeTemp();
      const enrichedPath = path.join(dir, 'castles_enriched.json');
      writeEnriched(enrichedPath, ENRICHED_BASE);

      runScript(enrichedPath, dir);

      assert.ok(!existsSync(path.join(pipelineDir, 'merge-report.json')));
    });
  });

});
