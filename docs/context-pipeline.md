# Graphify + UCM Context Pipeline

## Purpose

This scaffold defines a local, deterministic context pipeline for AI-assisted work in Topcastles. It starts from a Beads work item, uses Graphify as the structure resolver, then applies Universal Context Mode style selective context reduction so an agent receives only the smallest useful bundle of task, architecture, code, and verification context.

The pipeline is infrastructure only. It does not change Angular runtime behavior, Node server behavior, API routes, build output, deployment topology, or user data handling.

## Scope

Implemented now:

- A machine-readable config at `config/context-pipeline.json`.
- A deterministic index builder at `scripts/build-context-index.js`.
- A deterministic context resolver at `scripts/resolve-context.js`.
- Generated JSON artifacts under ignored `data/context/`.
- Beads metadata lookup with a fallback when `bd show` is unavailable.
- Graphify CLI lookups against `graphify-out/graph.json`.

Intentionally not implemented yet:

- Embeddings, vector search, databases, remote APIs, background daemons, or multi-container services.
- Runtime API endpoints for context retrieval.
- Mutation of prerendered content or generated app artifacts.
- Large code-aware slicing, AST parsing, or semantic ranking beyond transparent local rules.

## Architecture

The pipeline has three local steps:

1. Beads selects the work. A bead id supplies the task title, description, claimed work text, and optional user query text.
2. Graphify resolves structure. The resolver runs `graphify query graphify-out/graph.json <symbol>` for deterministic query terms and records any matched symbols or file paths.
3. The UCM-style reducer selects context. It scores indexed doc and code chunks by keyword overlap, category priority, Graphify direct matches, same-domain guardrails, and duplicate penalties.

The output is a compact JSON bundle intended for prompt construction or agent workflows.

## Index Schema

`scripts/build-context-index.js` scans approved roots from `config/context-pipeline.json` and writes `data/context/index.json`.

The index shape is:

```json
{
  "version": 1,
  "generated_at": "deterministic:<content-hash>",
  "roots": ["docs", "scripts"],
  "documents": [
    {
      "id": "docs-architecture-md",
      "path": "docs/architecture.md",
      "type": "doc",
      "category": "architecture",
      "tags": ["architecture", "adr", "runtime"],
      "headings": ["High-level architecture"],
      "summary": "Short excerpt",
      "keywords": ["runtime", "server"],
      "priority": 100,
      "chunk_refs": [
        {
          "chunk_id": "docs-architecture-md#1",
          "heading": "High-level architecture",
          "text": "Small excerpt",
          "tokens_estimate": 120
        }
      ]
    }
  ],
  "code": [
    {
      "id": "server-index-js",
      "path": "server/index.js",
      "type": "code",
      "category": "server",
      "symbols": ["app"],
      "imports": ["express"],
      "exports": [],
      "priority": 90,
      "chunk_refs": [
        {
          "chunk_id": "server-index-js#1",
          "symbol": "app",
          "kind": "module",
          "text": "Small excerpt",
          "tokens_estimate": 160
        }
      ]
    }
  ]
}
```

`generated_at` is a deterministic content hash rather than wall-clock time so consecutive builds are stable when source content is unchanged.

## Retrieval Ordering

The resolver prioritizes context in this order:

1. Bead/task context: bead title, description, local `bd show` output, and explicit `--query` text.
2. Architecture guardrails: ADRs, modernization/roadmap fragments, architecture docs, pipeline docs, and repo workflow rules.
3. Directly touched code: files or symbols found through Graphify and compact code excerpts from indexed roots.
4. Verification and runtime rules: server entrypoint behavior, build/start/test commands, SPA fallback, and write-safety rules.
5. Low-priority background context only when the chosen budget tier allows it.

Hard includes are represented by high category priority and scoring bonuses for Beads metadata, architecture/pipeline docs, current planning docs, and Graphify-matched files. Hard excludes are configured for generated output, dependencies, old exploratory areas, large assets, runtime data, and duplicate chunks.

## Token Budget Approach

Budgets are named `small`, `medium`, and `large` in the config. Each tier caps chunk counts by category, such as architecture docs, plans, workflow, code, adjacent code, verification rules, and background context. The scripts do not call a tokenizer; they estimate tokens locally as roughly one token per four characters.

## Beads Workflow

Beads is the entry point because it is the source of truth for active work in this repo. A typical flow is:

```bash
bd ready
bd show topcastles-2mn
bd update topcastles-2mn --claim
node scripts/build-context-index.js
node scripts/resolve-context.js topcastles-2mn --query "context pipeline scaffold" --budget medium
```

The generated bundle is written to `data/context/bundles/<bead-id>.json`. If `bd show` is not available, the resolver records the bead id and query text and emits a warning instead of failing the whole workflow.

## Graphify + UCM Combination

Graphify answers structural questions: where symbols and entry points live, which real paths exist in the generated graph, and which files are direct candidates for a task. UCM-style retrieval answers a different question: how much of that context should enter the prompt. The resolver combines both by giving Graphify matches a direct-file bonus while still preserving architecture guardrails and task text as higher-priority context.

The scoring model is intentionally transparent:

- Bead and query keyword overlap add score.
- Category priority comes from the config.
- Graphify direct matches get a bonus.
- Architecture and plan chunks get a guardrail bonus.
- Runtime and verification chunks get a smaller bonus.
- Duplicate or tiny chunks are penalized.

## Consuming A Bundle

An agent or Claude prompt can consume the JSON bundle by placing:

- `bead` and `query` at the top of the prompt as the task frame.
- `guardrails` immediately after the task frame.
- `selected_context` as bounded source material, preserving `path`, `category`, and `chunk_ref`.
- `touched_paths` and `graphify_symbols_checked` as the file/symbol evidence for any proposed edits.
- `warnings` as caveats that may require a fresh index build or manual Graphify check.

Example prompt instruction:

```text
Use data/context/bundles/topcastles-2mn.json as the only injected repository context.
Honor guardrails first, then inspect touched_paths before editing.
Do not request broad files unless the bundle warnings show the index is stale.
```

## Current Limitations

- The index is metadata plus compact excerpts, not a full source mirror.
- Code symbol extraction uses simple deterministic patterns, not a full AST.
- Graphify queries are derived from bead/query keywords; unusual symbol names may need an explicit `--query`.
- Generated bundles are local JSON artifacts under ignored `data/context/` and are not committed.
- This scaffold supports the current single-container, JSON-only architecture and should remain outside runtime handlers.
