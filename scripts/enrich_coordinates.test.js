#!/usr/bin/env node
import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateSearchVariants,
  resolveCountryCode,
  getCoords,
  searchWikidataVariants,
  normalizeCoordinates,
  getOverrideCoords,
  loadCoordinateOverrides,
} from './enrich_coordinates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('enrich_coordinates', () => {
  it('generates useful search variants for parenthetical names', () => {
    const variants = generateSearchVariants({
      castle_name: 'Foo (Bar) Castle',
      place: 'Dublin',
      country: 'Ireland',
    });

    assert.ok(variants.includes('Foo (Bar) Castle'));
    assert.ok(variants.includes('Foo'));
    assert.ok(variants.includes('Bar'));
    assert.ok(variants.includes('Foo Castle'));
    assert.ok(variants.includes('Castle Foo'));
    assert.ok(variants.includes('Dublin Foo (Bar) Castle'));
    assert.ok(variants.includes('Foo (Bar) Castle Ireland'));
  });

  it('resolves country names to ISO alpha-2 codes', () => {
    assert.equal(resolveCountryCode('France'), 'fr');
    assert.equal(resolveCountryCode('United Kingdom'), 'gb');
    assert.equal(resolveCountryCode('Scotland'), 'gb');
    assert.equal(resolveCountryCode('Czech Republic'), 'cz');
  });

  it('normalizes coordinates from override objects', () => {
    assert.deepEqual(normalizeCoordinates({ latitude: '51.5', longitude: '-0.1' }), { lat: 51.5, lon: -0.1 });
    assert.deepEqual(normalizeCoordinates({ lat: 48.8, lon: 2.3 }), { lat: 48.8, lon: 2.3 });
    assert.equal(normalizeCoordinates({ latitude: null, longitude: 1 }), null);
  });

  it('prefers manual override coordinates before lookup', async () => {
    const castle = {
      castle_code: 'test-castle',
      castle_name: 'Test Castle',
      country: 'Ireland',
      wikipedia_url: 'https://en.wikipedia.org/wiki/Test_Castle',
    };
    const result = await getCoords(castle, {
      overrides: {
        'test-castle': { latitude: 51.5, longitude: -0.1 },
      },
      nominatimOnly: true,
    });

    assert.equal(result._method, 'override');
    assert.equal(result.lat, 51.5);
    assert.equal(result.lon, -0.1);
  });

  it('scans all Wikidata candidates and prefers the first one with P625', async () => {
    const originalFetch = global.fetch;
    global.fetch = async (url) => {
      if (url.includes('wbsearchentities')) {
        return {
          ok: true,
          json: async () => ({
            search: [
              { id: 'Q1' },
              { id: 'Q2' },
            ],
          }),
        };
      }
      if (url.includes('wbgetentities')) {
        return {
          ok: true,
          json: async () => ({
            entities: {
              Q1: { claims: {} },
              Q2: { claims: { P625: [{ mainsnak: { datavalue: { value: { latitude: 10, longitude: 20 } } } }] } },
            },
          }),
        };
      }
      return { ok: false, json: async () => ({}) };
    };

    try {
      const triedQueries = [];
      const result = await searchWikidataVariants(['Test Castle'], triedQueries);
      assert.equal(result.lat, 10);
      assert.equal(result.lon, 20);
      assert.equal(result._qid, 'Q2');
      assert.deepEqual(triedQueries, ['wikidata:Test Castle']);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('returns the override map when the file exists and is valid', () => {
    const overrides = loadCoordinateOverrides(path.join(__dirname, 'coordinate_overrides.json'));
    assert.deepEqual(overrides, {});
  });
});
