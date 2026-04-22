#!/usr/bin/env node

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(REPO_ROOT, 'config', 'context-pipeline.json');

const TEXT_EXTENSIONS = new Set(['.md', '.json', '.js', '.ts', '.html', '.scss']);
const CODE_EXTENSIONS = new Set(['.js', '.ts', '.html', '.scss']);
const MAX_EXCERPT_CHARS = 900;

async function main() {
  const config = await readJson(CONFIG_PATH);
  const files = await collectIndexFiles(config);
  const documents = [];
  const code = [];

  for (const filePath of files) {
    const relPath = toRepoPath(filePath);
    const ext = path.extname(relPath);
    const text = await fs.readFile(filePath, 'utf8');

    if (ext === '.md' || relPath.endsWith('.json') && !CODE_EXTENSIONS.has(ext)) {
      documents.push(buildDocumentEntry(config, relPath, text));
    } else if (CODE_EXTENSIONS.has(ext)) {
      code.push(buildCodeEntry(config, relPath, text));
    }
  }

  documents.sort(compareByPath);
  code.sort(compareByPath);

  const fingerprint = hashText(JSON.stringify({
    version: config.version,
    roots: config.index_roots,
    documents: documents.map(stripVolatile),
    code: code.map(stripVolatile)
  }));

  const index = {
    version: 1,
    generated_at: `deterministic:${fingerprint}`,
    roots: [...config.index_roots].sort(),
    documents,
    code
  };

  await writeJsonAtomic(path.join(REPO_ROOT, config.outputs.index_path), index);
  console.log(`Wrote ${config.outputs.index_path} (${documents.length} docs, ${code.length} code files)`);
}

async function collectIndexFiles(config) {
  const collected = [];

  for (const root of config.index_roots) {
    const absRoot = path.join(REPO_ROOT, root);
    if (!(await exists(absRoot))) continue;
    const stat = await fs.stat(absRoot);
    if (stat.isDirectory()) {
      collected.push(...await walk(absRoot, config));
    } else if (shouldIndex(absRoot, config)) {
      collected.push(absRoot);
    }
  }

  return [...new Set(collected.map(file => path.resolve(file)))]
    .filter(file => shouldIndex(file, config))
    .sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)));
}

async function walk(dir, config) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absPath = path.join(dir, entry.name);
    if (isExcluded(absPath, config)) continue;
    if (entry.isDirectory()) {
      files.push(...await walk(absPath, config));
    } else if (entry.isFile() && shouldIndex(absPath, config)) {
      files.push(absPath);
    }
  }

  return files;
}

function shouldIndex(absPath, config) {
  const relPath = toRepoPath(absPath);
  if (isExcluded(absPath, config)) return false;
  return TEXT_EXTENSIONS.has(path.extname(relPath));
}

function isExcluded(absPath, config) {
  const relPath = toRepoPath(absPath);
  const segments = relPath.split('/');
  if (segments.includes('node_modules') || segments.includes('dist') || segments.includes('graphify-out')) {
    return true;
  }
  return config.hard_exclude_rules.some(rule => matchesPattern(relPath, rule));
}

function buildDocumentEntry(config, relPath, text) {
  const category = categoryForPath(relPath, config.document_categories, 'reference');
  const categoryConfig = config.document_categories[category] ?? config.document_categories.reference;
  const headings = extractHeadings(text);
  const chunks = chunkMarkdown(relPath, text);
  const summary = compactText(chunks[0]?.text ?? firstNonEmptyLines(text, 3));

  return {
    id: stableId(relPath),
    path: relPath,
    type: 'doc',
    category,
    tags: categoryConfig.tags ?? [],
    headings,
    summary,
    keywords: extractKeywords([relPath, headings.join(' '), summary].join(' ')),
    priority: categoryConfig.priority ?? 40,
    chunk_refs: chunks
  };
}

function buildCodeEntry(config, relPath, text) {
  const category = categoryForPath(relPath, config.code_categories, 'code');
  const categoryConfig = config.code_categories[category] ?? {};
  const symbols = extractSymbols(text);
  const imports = extractMatches(text, /^\s*import\s+.*?from\s+['"]([^'"]+)['"]/gm)
    .concat(extractMatches(text, /^\s*const\s+.*?=\s+require\(['"]([^'"]+)['"]\)/gm));
  const exports = extractMatches(text, /^\s*export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z0-9_$]+)/gm);

  return {
    id: stableId(relPath),
    path: relPath,
    type: 'code',
    category,
    symbols,
    imports: [...new Set(imports)].sort(),
    exports: [...new Set(exports)].sort(),
    priority: categoryConfig.priority ?? 50,
    chunk_refs: chunkCode(relPath, text, symbols)
  };
}

function chunkMarkdown(relPath, text) {
  const sections = [];
  const lines = text.split(/\r?\n/);
  let current = { heading: path.basename(relPath), lines: [] };

  for (const line of lines) {
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading && current.lines.length) {
      sections.push(current);
      current = { heading: heading[2].trim(), lines: [line] };
    } else {
      if (heading) current.heading = heading[2].trim();
      current.lines.push(line);
    }
  }
  if (current.lines.length) sections.push(current);

  return sections
    .map((section, index) => ({
      chunk_id: `${stableId(relPath)}#${index + 1}`,
      heading: section.heading,
      text: compactText(section.lines.join('\n')),
      tokens_estimate: estimateTokens(section.lines.join('\n'))
    }))
    .filter(chunk => chunk.text)
    .slice(0, 12);
}

function chunkCode(relPath, text, symbols) {
  const lines = text.split(/\r?\n/);
  const chunks = [];
  const symbolLines = symbols
    .map(symbol => ({ symbol, line: findSymbolLine(lines, symbol) }))
    .filter(item => item.line >= 0);

  const starts = symbolLines.length ? symbolLines.slice(0, 10) : [{ symbol: path.basename(relPath), line: 0 }];

  for (const [index, item] of starts.entries()) {
    const start = Math.max(0, item.line - 2);
    const excerpt = lines.slice(start, Math.min(lines.length, start + 24)).join('\n');
    chunks.push({
      chunk_id: `${stableId(relPath)}#${index + 1}`,
      symbol: item.symbol,
      kind: inferSymbolKind(excerpt),
      text: compactText(excerpt),
      tokens_estimate: estimateTokens(excerpt)
    });
  }

  return chunks;
}

function categoryForPath(relPath, categories, fallback) {
  for (const [category, config] of Object.entries(categories)) {
    if ((config.patterns ?? []).some(pattern => matchesPattern(relPath, pattern))) {
      return category;
    }
  }
  return fallback;
}

function matchesPattern(relPath, pattern) {
  const normalized = relPath.replace(/\\/g, '/');
  const escaped = pattern
    .replace(/\\/g, '/')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*');
  return new RegExp(`^${escaped}$`).test(normalized);
}

function extractHeadings(text) {
  return [...text.matchAll(/^(#{1,4})\s+(.+)$/gm)]
    .map(match => match[2].trim())
    .slice(0, 30);
}

function extractSymbols(text) {
  const patterns = [
    /^\s*export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/gm,
    /^\s*(?:async\s+)?function\s+([A-Za-z0-9_$]+)/gm,
    /^\s*export\s+class\s+([A-Za-z0-9_$]+)/gm,
    /^\s*class\s+([A-Za-z0-9_$]+)/gm,
    /^\s*export\s+const\s+([A-Za-z0-9_$]+)/gm,
    /^\s*const\s+([A-Za-z0-9_$]+)\s*=/gm
  ];

  return [...new Set(patterns.flatMap(pattern => extractMatches(text, pattern)))]
    .filter(symbol => symbol.length > 1)
    .sort();
}

function extractMatches(text, pattern) {
  return [...text.matchAll(pattern)].map(match => match[1]);
}

function findSymbolLine(lines, symbol) {
  return lines.findIndex(line => line.includes(symbol));
}

function inferSymbolKind(text) {
  if (/\bclass\b/.test(text)) return 'class';
  if (/\bfunction\b|=>/.test(text)) return 'function';
  return 'module';
}

function extractKeywords(text) {
  const stop = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'json', 'html', 'scss']);
  return [...new Set(text.toLowerCase()
    .replace(/[^a-z0-9_\-/ ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stop.has(word)))]
    .sort()
    .slice(0, 40);
}

function compactText(text) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_EXCERPT_CHARS);
}

function firstNonEmptyLines(text, count) {
  return text.split(/\r?\n/).filter(line => line.trim()).slice(0, count).join(' ');
}

function estimateTokens(text) {
  return Math.ceil(text.replace(/\s+/g, ' ').trim().length / 4);
}

function stableId(relPath) {
  return relPath.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function hashText(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function stripVolatile(entry) {
  return entry;
}

function compareByPath(a, b) {
  return a.path.localeCompare(b.path);
}

function toRepoPath(absPath) {
  return path.relative(REPO_ROOT, absPath).replace(/\\/g, '/');
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

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
