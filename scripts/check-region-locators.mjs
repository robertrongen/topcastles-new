#!/usr/bin/env node
import {
  buildRegionInventory,
  CASTLES_PATH,
  MANIFEST_PATH,
  manifestSummary,
  markLegacyMaps,
  readJson,
  validateManifest,
} from './region-locators.mjs';

const castles = await readJson(CASTLES_PATH);
const inventory = await markLegacyMaps(buildRegionInventory(castles));
const manifest = await readJson(MANIFEST_PATH, {});
const errors = validateManifest(manifest, inventory);
const summary = manifestSummary(manifest);

if (errors.length > 0) {
  for (const error of errors) console.error(`[locators:check] ${error}`);
  process.exit(1);
}

console.log(`[locators:check] OK: ${summary.total} regions, ${summary.configured} configured, ${summary.unresolved} unresolved.`);
