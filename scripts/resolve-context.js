#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(REPO_ROOT, 'config', 'context-pipeline.json');

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.beadId) {
    throw new Error('Usage: node scripts/resolve-context.js <bead-id> [--query "text"] [--budget small|medium|large] [--out path]');
  }

  const config = await readJson(CONFIG_PATH);
  const indexPath = path.join(REPO_ROOT, config.outputs.index_path);
  const index = await readJson(indexPath);
  const budgetTier = args.budget ?? 'medium';
  const budget = config.token_budget_tiers[budgetTier] ?? config.token_budget_tiers.medium;
  const bead = loadBeadMetadata(config, args.beadId);
  const query = compactText([bead.title, bead.description, bead.raw, args.query].filter(Boolean).join('\n'));
  const queryKeywords = extractKeywords(query);
  const graphify = resolveGraphify(config, queryKeywords, query);
  const candidates = buildCandidates(index, config, queryKeywords, graphify.touched_paths);
  const selected = selectCandidates(candidates, budget);
  const selectedContext = selected.map(candidate => ({
    id: candidate.id,
    path: candidate.path,
    type: candidate.type,
    category: candidate.category,
    priority: candidate.priority,
    score: candidate.score,
    chunk_ref: candidate.chunk_ref,
    text: candidate.text
  }));

  const bundle = {
    bead_id: args.beadId,
    bead,
    query,
    budget_tier: budgetTier,
    selected_context: [
      {
        id: `bead-${args.beadId}`,
        path: null,
        type: 'bead',
        category: 'bead_task_context',
        priority: 1000,
        score: 1000,
        chunk_ref: {
          chunk_id: `bead-${args.beadId}`,
          heading: 'Bead task context',
          tokens_estimate: estimateTokens(query)
        },
        text: query || args.beadId
      },
      ...selectedContext
    ],
    selection_reasoning: selected.map(candidate => ({
      id: candidate.id,
      path: candidate.path,
      reason: candidate.reason,
      score: candidate.score
    })),
    guardrails: selected
      .filter(candidate => ['architecture', 'plans', 'workflow', 'context_pipeline'].includes(candidate.category))
      .map(candidate => ({
        path: candidate.path,
        heading: candidate.chunk_ref.heading ?? candidate.chunk_ref.symbol ?? null,
        reason: candidate.reason
      })),
    touched_paths: graphify.touched_paths,
    graphify_symbols_checked: graphify.graphify_symbols_checked,
    why_each_item_was_selected: selected.map(candidate => ({
      id: candidate.id,
      why: candidate.reason
    })),
    excluded_candidates_summary: summarizeExcluded(candidates, selected),
    warnings: [
      ...bead.warnings,
      ...graphify.warnings
    ]
  };

  const outPath = path.join(REPO_ROOT, args.out ?? path.join(config.outputs.bundle_dir, `${safeFileName(args.beadId)}.json`));
  await writeJsonAtomic(outPath, bundle);
  console.log(`Wrote ${path.relative(REPO_ROOT, outPath).replace(/\\/g, '/')}`);
}

function buildCandidates(index, config, queryKeywords, touchedPaths) {
  const touched = new Set(touchedPaths);
  const docs = index.documents.flatMap(doc => doc.chunk_refs.map(chunk => candidateFromEntry(doc, chunk, queryKeywords, touched, config)));
  const code = index.code.flatMap(entry => entry.chunk_refs.map(chunk => candidateFromEntry(entry, chunk, queryKeywords, touched, config)));
  return [...docs, ...code].sort((a, b) => b.score - a.score || a.path.localeCompare(b.path) || a.id.localeCompare(b.id));
}

function candidateFromEntry(entry, chunk, queryKeywords, touched, config) {
  const haystack = [
    entry.path,
    entry.category,
    ...(entry.tags ?? []),
    ...(entry.keywords ?? []),
    chunk.heading,
    chunk.symbol,
    chunk.text
  ].filter(Boolean).join(' ').toLowerCase();

  const overlap = queryKeywords.filter(keyword => haystack.includes(keyword)).length;
  const directMatch = touched.has(entry.path) ? 40 : 0;
  const architectureBonus = ['architecture', 'plans', 'context_pipeline'].includes(entry.category) ? 30 : 0;
  const verificationBonus = isVerificationRule(entry, chunk) ? 20 : 0;
  const duplicatePenalty = duplicateLike(chunk.text) ? -15 : 0;
  const score = entry.priority + overlap * 12 + directMatch + architectureBonus + verificationBonus + duplicatePenalty;

  return {
    id: `${entry.id}:${chunk.chunk_id}`,
    path: entry.path,
    type: entry.type,
    category: entry.category,
    priority: entry.priority,
    score,
    chunk_ref: stripChunkText(chunk),
    text: chunk.text,
    reason: reasonForSelection(entry, overlap, directMatch, architectureBonus, verificationBonus)
  };
}

function selectCandidates(candidates, budget) {
  const selected = [];
  const seenText = new Set();
  const counts = new Map();

  for (const candidate of candidates) {
    if (selected.length >= budget.max_total_chunks) break;
    const group = budgetGroup(candidate.category, candidate.type);
    const maxForGroup = budget[group] ?? budget.background ?? 1;
    const count = counts.get(group) ?? 0;
    const textKey = compactText(candidate.text).toLowerCase();
    if (count >= maxForGroup || seenText.has(textKey)) continue;
    selected.push(candidate);
    counts.set(group, count + 1);
    seenText.add(textKey);
  }

  return selected.sort((a, b) => priorityOrder(a) - priorityOrder(b) || b.score - a.score || a.path.localeCompare(b.path));
}

function budgetGroup(category, type) {
  if (category === 'architecture') return 'architecture';
  if (category === 'plans') return 'plans';
  if (category === 'workflow') return 'workflow';
  if (category === 'context_pipeline') return 'context_pipeline';
  if (type === 'code') return 'code';
  if (category === 'server') return 'verification';
  return 'background';
}

function priorityOrder(candidate) {
  if (['architecture', 'plans', 'workflow', 'context_pipeline'].includes(candidate.category)) return 2;
  if (candidate.type === 'code') return 3;
  if (candidate.category === 'server') return 4;
  return 5;
}

function resolveGraphify(config, queryKeywords, query) {
  const graphPath = path.join(REPO_ROOT, config.graphify.graph_path);
  const maxQueries = config.graphify.max_symbol_queries ?? 8;
  const symbols = queryKeywords
    .filter(keyword => /^[a-z0-9_-]{4,}$/.test(keyword) && /[a-z]/.test(keyword))
    .slice(0, maxQueries);
  const touched = new Set();
  const checked = [];
  const warnings = [];

  for (const symbol of symbols) {
    try {
      const output = execFileSync('graphify', ['query', graphPath, symbol], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        shell: process.platform === 'win32',
        stdio: ['ignore', 'pipe', 'pipe']
      });
      checked.push({ symbol, output: output.trim().split(/\r?\n/).slice(0, 8) });
      for (const line of output.split(/\r?\n/)) {
        const match = line.match(/[A-Z]:\\.*?:\d+/);
        if (!match) continue;
        const filePath = match[0].replace(/:\d+$/, '');
        const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');
        if (!isExcludedPath(relPath, config) && isIndexedPath(relPath, config)) touched.add(relPath);
      }
    } catch (error) {
      checked.push({ symbol, output: [] });
      warnings.push(`Graphify query failed for "${symbol}": ${error.message}`);
    }
  }

  for (const relPath of extractDirectPaths(query, config)) {
    touched.add(relPath);
  }

  return {
    touched_paths: [...touched].sort(),
    graphify_symbols_checked: checked,
    warnings
  };
}

function extractDirectPaths(query, config) {
  return query
    .split(/\s+/)
    .map(value => value.replace(/^[`"']|[`"',:;]+$/g, ''))
    .filter(value => value.includes('/') || value.includes('\\'))
    .map(value => value.replace(/\\/g, '/'))
    .filter(value => !isExcludedPath(value, config) && isIndexedPath(value, config));
}

function isIndexedPath(relPath, config) {
  return config.index_roots.some(root => relPath === root || relPath.startsWith(`${root.replace(/\\/g, '/')}/`));
}

function isExcludedPath(relPath, config) {
  const segments = relPath.split('/');
  if (segments.includes('node_modules') || segments.includes('dist') || segments.includes('graphify-out')) {
    return true;
  }
  return config.hard_exclude_rules.some(rule => matchesPattern(relPath, rule));
}

function matchesPattern(relPath, pattern) {
  const escaped = pattern
    .replace(/\\/g, '/')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*');
  return new RegExp(`^${escaped}$`).test(relPath);
}

function loadBeadMetadata(config, beadId) {
  if (!config.beads.enabled) {
    return { id: beadId, title: '', description: '', raw: '', source: 'disabled', warnings: [] };
  }

  try {
    const output = execFileSync(config.beads.cli, [...config.beads.show_command, beadId], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    return {
      id: beadId,
      title: parseBeadTitle(output),
      description: parseBeadDescription(output),
      raw: output.trim(),
      source: 'bd show',
      warnings: []
    };
  } catch (error) {
    return {
      id: beadId,
      title: beadId,
      description: '',
      raw: '',
      source: 'fallback',
      warnings: [`Beads metadata unavailable for "${beadId}": ${error.message}`]
    };
  }
}

function parseBeadTitle(output) {
  const line = output.split(/\r?\n/).find(item => item.includes('—') || item.includes('-'));
  return line ? line.replace(/^[○◐●✓❄\s]*/, '').trim() : '';
}

function parseBeadDescription(output) {
  const lines = output.split(/\r?\n/);
  const start = lines.findIndex(line => /^Description:/i.test(line.trim()));
  if (start < 0) return '';
  return lines.slice(start + 1).join('\n').trim();
}

function reasonForSelection(entry, overlap, directMatch, architectureBonus, verificationBonus) {
  const reasons = [`${entry.category} priority ${entry.priority}`];
  if (overlap) reasons.push(`${overlap} query keyword matches`);
  if (directMatch) reasons.push('Graphify direct file match');
  if (architectureBonus) reasons.push('architecture/plan guardrail');
  if (verificationBonus) reasons.push('verification/runtime rule');
  return reasons.join('; ');
}

function isVerificationRule(entry, chunk) {
  const text = `${entry.path} ${chunk.heading ?? ''} ${chunk.text}`.toLowerCase();
  return ['server', 'build', 'start', 'test', 'spa fallback', 'runtime', 'api'].some(term => text.includes(term));
}

function duplicateLike(text) {
  return compactText(text).length < 40;
}

function summarizeExcluded(candidates, selected) {
  const selectedIds = new Set(selected.map(candidate => candidate.id));
  const excluded = candidates.filter(candidate => !selectedIds.has(candidate.id));
  const byCategory = {};
  for (const candidate of excluded) {
    byCategory[candidate.category] = (byCategory[candidate.category] ?? 0) + 1;
  }
  return {
    total_candidates: candidates.length,
    selected_candidates: selected.length,
    excluded_candidates: excluded.length,
    excluded_by_category: Object.fromEntries(Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)))
  };
}

function stripChunkText(chunk) {
  const { text: _text, ...rest } = chunk;
  return rest;
}

function parseArgs(argv) {
  const args = { beadId: null, query: '', budget: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === '--query') args.query = argv[++i] ?? '';
    else if (value === '--budget') args.budget = argv[++i] ?? null;
    else if (value === '--out') args.out = argv[++i] ?? null;
    else if (!args.beadId) args.beadId = value;
  }
  return args;
}

function extractKeywords(text) {
  const stop = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'json', 'task', 'issue']);
  return [...new Set(text.toLowerCase()
    .replace(/[^a-z0-9_\-/ ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stop.has(word)))]
    .sort()
    .slice(0, 60);
}

function compactText(text) {
  return text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function estimateTokens(text) {
  return Math.ceil(text.replace(/\s+/g, ' ').trim().length / 4);
}

function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJsonAtomic(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tmp, filePath);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
