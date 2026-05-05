#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  classifyPixels,
  configuredEntries,
  detectBgMode,
  detectHighlightHue,
  MANIFEST_PATH,
  MAPS_DIR,
  paintPixels,
  RAW_DIR,
  readJson,
} from './region-locators.mjs';

const OUTPUT_MAX = 640;

const PALETTES = {
  dark: {
    suffix: '.dark',
    OCHRE:     [201, 134,  63],   // #C9863F
    NEIGHBOUR: [ 42,  53,  80],   // #2a3550
    COAST:     [ 58,  66,  88],   // #3a4258
  },
  light: {
    suffix: '.light',
    OCHRE:     [201, 134,  63],   // #C9863F  — keep
    NEIGHBOUR: [231, 226, 214],   // #E7E2D6  parchment
    COAST:     [168, 154, 120],   // #A89A78  ochre-grey
  },
};

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('[locators:build] Missing dependency "sharp". Run: npm install --prefix scripts');
  process.exit(1);
}

const manifest = await readJson(MANIFEST_PATH, {});
const entries = configuredEntries(manifest);

if (entries.length === 0) {
  console.log('[locators:build] No configured manifest entries. Fill commons first.');
  process.exit(0);
}

await fs.mkdir(MAPS_DIR, { recursive: true });

let built = 0;
for (const [regionCode, entry] of entries) {
  const raw = await findRaw(regionCode);
  if (!raw) {
    console.warn(`[locators:build] missing raw file for ${regionCode}`);
    continue;
  }

  // Resolve hue and bgMode — prefer explicit manifest values, auto-detect when absent.
  let highlightHueRGB = entry.highlightHueRGB;
  let bgMode = entry.bgMode;

  if (!highlightHueRGB || entry.autoDetectHue === true) {
    highlightHueRGB = await detectHighlightHue(raw);
    if (!highlightHueRGB) {
      console.warn(`[locators:build] ${regionCode}: could not auto-detect highlight hue — skipping`);
      continue;
    }
    console.log(`[locators:build] ${regionCode} auto-detected highlight = [${highlightHueRGB.join(', ')}]`);
  }

  if (!bgMode || entry.autoDetectBgMode === true) {
    bgMode = await detectBgMode(raw);
    console.log(`[locators:build] ${regionCode} auto-detected bgMode = ${bgMode}`);
  }

  const effectiveEntry = { ...entry, highlightHueRGB, bgMode };

  const { data, info } = await sharp(raw, { density: 300, limitInputPixels: false })
    .resize({ width: OUTPUT_MAX, height: OUTPUT_MAX, fit: 'inside', kernel: 'nearest' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Classify once, paint twice — mask and confetti filter are shared across palettes.
  const px = new Uint8ClampedArray(data);
  const mask = classifyPixels(px, effectiveEntry, info.width);

  for (const [, pal] of Object.entries(PALETTES)) {
    const pxCopy = new Uint8ClampedArray(px);
    paintPixels(pxCopy, mask, pal);
    await sharp(pxCopy, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(MAPS_DIR, `${regionCode}${pal.suffix}.png`));
  }

  built++;
  console.log(`[locators:build] ${regionCode}.png ${info.width}x${info.height}`);
}

console.log(`[locators:build] Built ${built}/${entries.length} configured locators.`);

async function findRaw(regionCode) {
  for (const ext of ['svg', 'png', 'jpg', 'jpeg']) {
    const filePath = path.join(RAW_DIR, `${regionCode}.${ext}`);
    try {
      await fs.stat(filePath);
      return filePath;
    } catch {}
  }
  // Fallback: use existing legacy map from the maps output directory.
  for (const ext of ['jpg', 'png']) {
    const filePath = path.join(MAPS_DIR, `${regionCode}.${ext}`);
    try {
      await fs.stat(filePath);
      console.log(`[locators:build] ${regionCode}: using legacy fallback ${regionCode}.${ext}`);
      return filePath;
    } catch {}
  }
  return null;
}
