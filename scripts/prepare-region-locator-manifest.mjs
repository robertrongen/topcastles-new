#!/usr/bin/env node
import {
  buildRegionInventory,
  CASTLES_PATH,
  MANIFEST_PATH,
  manifestSummary,
  markLegacyMaps,
  mergeManifest,
  readJson,
  validateManifest,
  writeJson,
} from './region-locators.mjs';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

const castles = await readJson(CASTLES_PATH);
if (!Array.isArray(castles)) {
  throw new Error(`${CASTLES_PATH} must contain a castle array.`);
}

const inventory = await markLegacyMaps(buildRegionInventory(castles));
const existing = await readJson(MANIFEST_PATH, {});
const manifest = mergeManifest(inventory, existing);
const errors = validateManifest(manifest, inventory);
const summary = manifestSummary(manifest);

if (errors.length > 0) {
  for (const error of errors) console.error(`[locators:inventory] ${error}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`[locators:inventory] OK: ${summary.total} regions, ${summary.configured} configured, ${summary.unresolved} unresolved.`);
} else {
  await writeJson(MANIFEST_PATH, manifest);
  console.log(`[locators:inventory] Wrote ${MANIFEST_PATH}`);
  console.log(`[locators:inventory] ${summary.total} regions, ${summary.configured} configured, ${summary.unresolved} unresolved.`);
}
