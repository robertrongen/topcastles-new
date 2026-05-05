#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  configuredEntries,
  MANIFEST_PATH,
  MAPS_DIR,
  RAW_DIR,
  readJson,
  recolourLocatorPixels,
} from './region-locators.mjs';

const OUTPUT_MAX = 640;

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
  console.log('[locators:build] No configured manifest entries. Fill commons + highlightHueRGB first.');
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

  const { data, info } = await sharp(raw, { density: 300 })
    .resize({ width: OUTPUT_MAX, height: OUTPUT_MAX, fit: 'inside', kernel: 'nearest' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = new Uint8ClampedArray(data);
  recolourLocatorPixels(px, entry);

  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(MAPS_DIR, `${regionCode}.png`));

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
  return null;
}
