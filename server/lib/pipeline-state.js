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

export function rebuildRequestPath(dataDir) {
  return path.join(dataDir, 'pipeline', 'rebuild-request.json');
}

export function rebuildHistoryPath(dataDir) {
  return path.join(dataDir, 'pipeline', 'rebuild-history.json');
}

export async function readPipelineMeta(dataDir) {
  const existing = await readJson(pipelineMetaPath(dataDir));
  return existing ? { ...DEFAULT_META, ...existing } : { ...DEFAULT_META };
}

export async function updatePipelineMeta(dataDir, patch) {
  const current = await readPipelineMeta(dataDir);
  await writeJson(pipelineMetaPath(dataDir), { ...current, ...patch });
}

export function castleOverridesPath(dataDir) {
  return path.join(dataDir, 'pipeline', 'castle-overrides.json');
}

export async function readCastleOverrides(dataDir) {
  return (await readJson(castleOverridesPath(dataDir))) ?? {};
}

export async function writeCastleOverrides(dataDir, overrides) {
  return writeJson(castleOverridesPath(dataDir), overrides);
}

export async function readRebuildRequest(dataDir) {
  return readJson(rebuildRequestPath(dataDir));
}

export async function createRebuildRequest(dataDir, { reason, requestedBy }) {
  const entry = {
    requestedAt: new Date().toISOString(),
    requestedBy,
    reason,
    status: 'requested',
  };
  await writeJson(rebuildRequestPath(dataDir), entry);
  const history = (await readJson(rebuildHistoryPath(dataDir))) ?? [];
  await writeJson(rebuildHistoryPath(dataDir), [...history, entry]);
  return entry;
}

// ── Enrichment request ────────────────────────────────────────────────────────

export const ENRICHMENT_TYPES = ['wikipedia', 'wikidata', 'coordinates', 'full'];

export function enrichmentRequestPath(dataDir) {
  return path.join(dataDir, 'pipeline', 'enrichment-request.json');
}

export function enrichmentHistoryPath(dataDir) {
  return path.join(dataDir, 'pipeline', 'enrichment-history.json');
}

export async function readEnrichmentRequest(dataDir) {
  return readJson(enrichmentRequestPath(dataDir));
}

export async function createEnrichmentRequest(dataDir, { type, reason, requestedBy }) {
  const entry = {
    requestedAt: new Date().toISOString(),
    requestedBy,
    type,
    reason,
    status: 'requested',
  };
  await writeJson(enrichmentRequestPath(dataDir), entry);
  const history = (await readJson(enrichmentHistoryPath(dataDir))) ?? [];
  await writeJson(enrichmentHistoryPath(dataDir), [...history, entry]);
  return entry;
}
