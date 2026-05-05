#!/usr/bin/env node
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRegionInventory,
  commonsFilePathUrl,
  manifestSummary,
  mergeManifest,
  recolourLocatorPixels,
  validateManifest,
} from './region-locators.mjs';

const CASTLES = [
  { region: 'Loire', region_code: 'loire', country: 'France' },
  { region: 'Loire', region_code: 'loire', country: 'France' },
  { region: 'Bavaria', region_code: 'bavaria', country: 'Germany' },
  { region: 'Bavaria', region_code: 'bavaria', country: 'Germany' },
  { region: 'Clwyd', region_code: 'clwyd', country: 'Wales' },
  { region: 'Clywd', region_code: 'clwyd', country: 'Wales' },
];

describe('region locator helpers', () => {
  it('builds one inventory row per region_code and preserves label variants', () => {
    const inventory = buildRegionInventory(CASTLES);

    assert.equal(inventory.length, 3);
    assert.equal(inventory.find(item => item.regionCode === 'loire').castleCount, 2);
    assert.deepEqual(inventory.find(item => item.regionCode === 'clwyd').regions, ['Clwyd', 'Clywd']);
  });

  it('merges existing manifest data into a full region_code scaffold', () => {
    const inventory = buildRegionInventory(CASTLES);
    const manifest = mergeManifest(inventory, {
      loire: {
        commons: 'Centre-Val_de_Loire_in_France.svg',
        highlightHueRGB: [80, 110, 175],
        bgMode: 'pastel',
        credit: 'Example',
        license: 'CC-BY-SA-3.0',
      },
    });

    assert.equal(Object.keys(manifest).length, 3);
    assert.equal(manifest.loire.commons, 'Centre-Val_de_Loire_in_France.svg');
    assert.equal(manifest.bavaria.commons, '');
    assert.deepEqual(manifestSummary(manifest), { total: 3, configured: 1, unresolved: 2 });
  });

  it('validates configured entries and reports stale manifest keys', () => {
    const inventory = buildRegionInventory(CASTLES);
    const manifest = mergeManifest(inventory, {
      loire: { commons: 'Centre-Val_de_Loire_in_France.svg', highlightHueRGB: [80, 110, 175], bgMode: 'pastel' },
    });

    assert.deepEqual(validateManifest(manifest, inventory), []);

    manifest.ghost = { commons: '', highlightHueRGB: null, bgMode: 'white' };
    assert.ok(validateManifest(manifest, inventory).some(error => error.includes('ghost')));
  });

  it('recolours highlight, background, and coast pixels', () => {
    const pixels = new Uint8ClampedArray([
      80, 110, 175, 255,
      255, 255, 255, 255,
      10, 10, 10, 255,
    ]);

    recolourLocatorPixels(pixels, {
      highlightHueRGB: [80, 110, 175],
      bgMode: 'pastel',
    });

    assert.ok(pixels[0] > 150 && pixels[1] > 90 && pixels[2] < 100);
    assert.equal(pixels[7], 0);
    assert.deepEqual([...pixels.slice(8, 12)], [58, 66, 88, 255]);
  });

  it('builds Wikimedia Special:FilePath URLs', () => {
    assert.equal(
      commonsFilePathUrl('Centre-Val de Loire.svg'),
      'https://commons.wikimedia.org/wiki/Special:FilePath/Centre-Val%20de%20Loire.svg'
    );
  });
});
