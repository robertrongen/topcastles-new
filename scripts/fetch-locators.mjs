#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  commonsFilePathUrl,
  fetchableEntries,
  MANIFEST_PATH,
  RAW_DIR,
  readJson,
} from './region-locators.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

const manifest = await readJson(MANIFEST_PATH, {});
const entries = fetchableEntries(manifest).slice(0, Number.isFinite(limit) ? limit : undefined);
const ua = process.env.WIKIMEDIA_USER_AGENT || 'TopcastlesLocatorFetcher/1.0 (https://topcastles.com; contact: configure WIKIMEDIA_USER_AGENT)';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  // sharp unavailable — dimension checks will be skipped
}

await fs.mkdir(RAW_DIR, { recursive: true });

if (entries.length === 0) {
  console.log('[locators:fetch] No fetchable manifest entries. Fill commons first.');
  process.exit(0);
}

for (const [regionCode, entry] of entries) {
  const ext = path.extname(entry.commons).toLowerCase().slice(1) || 'bin';
  const dest = path.join(RAW_DIR, `${regionCode}.${ext}`);

  if (!force && await exists(dest)) {
    console.log(`[locators:fetch] cached ${regionCode}`);
    continue;
  }

  const url = commonsFilePathUrl(entry.commons);
  if (dryRun) {
    console.log(`[locators:fetch] would fetch ${regionCode}: ${url}`);
    continue;
  }

  process.stdout.write(`[locators:fetch] fetching ${regionCode} ... `);
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) {
    console.log(`FAIL ${res.status}`);
    continue;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`${kb} KB`);

  await validateFetched(dest, regionCode, buf.length);

  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function validateFetched(filePath, regionCode, byteLength) {
  const kb = byteLength / 1024;
  if (kb < 5) {
    console.warn(`[locators:fetch] WARN ${regionCode}: file looks like a thumbnail or error page (${kb.toFixed(1)} KB)`);
    return;
  }

  if (!sharp) return;

  try {
    const meta = await sharp(filePath, { density: 72, limitInputPixels: false }).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w < 200 || h < 200) {
      console.warn(`[locators:fetch] WARN ${regionCode}: file looks like a thumbnail or error page (${kb.toFixed(1)} KB, ${w}x${h})`);
    }
  } catch {
    console.warn(`[locators:fetch] WARN ${regionCode}: could not read image metadata from fetched file`);
  }
}

async function exists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}
