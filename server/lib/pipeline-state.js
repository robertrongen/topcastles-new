import path from 'path';
import { readJson, writeJson } from './json-store.js';

const DEFAULT_META = {
  lastStagedAt: null,
  lastStagedHash: null,
  lastBuildAt: null,
  lastDeployAt: null,
  notes: [],
};

export function pipelineMetaPath(dataDir) {
  return path.join(dataDir, 'pipeline', 'meta.json');
}

export async function readPipelineMeta(dataDir) {
  const existing = await readJson(pipelineMetaPath(dataDir));
  return existing ? { ...DEFAULT_META, ...existing } : { ...DEFAULT_META };
}

export async function updatePipelineMeta(dataDir, patch) {
  const current = await readPipelineMeta(dataDir);
  await writeJson(pipelineMetaPath(dataDir), { ...current, ...patch });
}
