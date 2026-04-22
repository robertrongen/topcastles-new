#!/usr/bin/env node
/**
 * Runs the canonical data regeneration pipeline in order.
 *
 * `data:lean` exits with code 1 when generated data requires a rebuild of
 * prerendered HTML. That is a useful signal, not a failed regeneration, so this
 * wrapper records it and continues with downstream generated artifacts.
 */

import { spawnSync } from 'child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const steps = [
  { script: 'data:convert' },
  { script: 'data:enrich:wikipedia' },
  { script: 'data:enrich:wikidata' },
  { script: 'data:lean', allowRebuildSignal: true },
  { script: 'data:api' },
  { script: 'data:sitemap' },
  { script: 'data:routes' },
];

let rebuildRequired = false;

for (const step of steps) {
  console.log(`\n==> npm run ${step.script}`);
  const result = spawnSync(npmCommand, ['run', step.script], {
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    console.error(`Failed to start npm run ${step.script}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status === 0) {
    continue;
  }

  if (step.allowRebuildSignal && result.status === 1) {
    rebuildRequired = true;
    console.log('\nContinuing: data:lean reported that prerendered HTML needs a rebuild.');
    continue;
  }

  console.error(`npm run ${step.script} failed with exit code ${result.status}.`);
  process.exit(result.status ?? 1);
}

console.log('\nData regeneration complete.');
if (rebuildRequired) {
  console.log('Rebuild required: run npm run build before publishing prerendered output.');
}
