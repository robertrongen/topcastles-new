#!/usr/bin/env node
import { spawn } from 'child_process';

const DEFAULT_WINDOWS_CASTLE_IMAGE_PATH = '\\\\DS224plus\\docker\\topcastles\\images\\castles';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

if (!process.env.CASTLE_IMAGE_PATH && process.platform === 'win32') {
  process.env.CASTLE_IMAGE_PATH = DEFAULT_WINDOWS_CASTLE_IMAGE_PATH;
}

const children = [
  spawn(npmCommand, ['run', 'dev:server'], { stdio: 'inherit' }),
  spawn(npmCommand, ['run', 'dev:app'], { stdio: 'inherit' }),
];

let shuttingDown = false;

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(exitCode);
}

for (const child of children) {
  child.on('exit', code => {
    if (!shuttingDown) stop(code ?? 0);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
