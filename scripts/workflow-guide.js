#!/usr/bin/env node

import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function main() {
  const beadId = process.argv[2]?.trim();
  const indexPath = path.join(REPO_ROOT, 'data', 'context', 'index.json');
  const bundlePath = beadId
    ? path.join(REPO_ROOT, 'data', 'context', 'bundles', `${beadId.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}.json`)
    : null;

  console.log('Topcastles Workflow Guide');
  console.log('');
  console.log('1) Start from a bead');
  console.log('   bd ready');
  console.log('   bd show <id>');
  console.log('   bd update <id> --claim');
  console.log('');
  console.log('2) Discover with Graphify before broad file reading');
  console.log('   npm run graph:query -- <symbol>');
  console.log('');
  console.log('3) Build and resolve minimal context for non-trivial work');
  console.log('   npm run context:index');
  console.log('   npm run context:resolve -- <id> --query "<focus>" --budget medium');
  console.log('');
  console.log('4) Verify before closing');
  console.log('   npm test');
  console.log('   npm run build');
  console.log('   npm run dev:server');
  console.log('   Check /, /api/health, /api/index.json, unknown SPA route, and deep links');
  console.log('');
  console.log('5) Close and push');
  console.log('   bd close <id>');
  console.log('   git pull --rebase');
  console.log('   bd dolt push');
  console.log('   git push');
  console.log('');

  console.log(`Context index: ${existsSync(indexPath) ? 'present' : 'missing'} (${toRelative(indexPath)})`);
  if (beadId) {
    console.log(`Bundle for ${beadId}: ${existsSync(bundlePath) ? 'present' : 'missing'} (${toRelative(bundlePath)})`);
  } else {
    console.log('Tip: pass a bead id to also check the expected bundle path.');
  }
}

function toRelative(absPath) {
  return path.relative(REPO_ROOT, absPath).replace(/\\/g, '/');
}

main();
