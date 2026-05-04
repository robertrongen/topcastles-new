# Developer Guide - Topcastles

This is the human developer workflow guide for Topcastles. For machine-agent requirements, use [AGENTS.md](AGENTS.md). For the project overview, see [README.md](README.md).

## Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| Node.js | >= 18 | Angular app, scripts, and Node server |
| npm | >= 9 | Package management |
| Python | >= 3.9 | Data conversion scripts |
| Docker | any | Container builds |
| bash | any | `deploy.sh` |

## Setup

```bash
git clone https://github.com/robertrongen/topcastles
cd topcastles
npm run install:all
```

`install:all` installs dependencies for `new_app/`, `scripts/`, and `server/`. `node_modules/` directories are local only and must not be committed.

## Local Development

Run the Node API/image server and Angular dev server together:

```bash
npm start
```

Open <http://localhost:4200>. The Angular dev server proxies `/api/*` and `/castle-images/*` requests to the Node server on port 3000.

For Angular-only UI work that does not need proxied APIs or images:

```bash
npm run dev:app
```

For the Node server only:

```bash
npm run dev:server
curl http://localhost:3000/api/health
```

## Build And Test

```bash
npm run build
npm test
npm test -- --watch=false --browsers=ChromeHeadless
```

`npm run build` produces Angular build and prerender output under `new_app/dist/new_app/`. That output is ignored and should be recreated rather than committed.

The root `npm test` script intentionally calls Angular directly with `npx --prefix new_app ng test --watch=false --browsers=ChromeHeadless`. Do not simplify it back to `npm test --prefix new_app`: on Windows/npm that wrapper can swallow Angular CLI flags, leaving Karma in watch mode with regular Chrome.

## Runtime Server

Production runs:

```bash
node server/index.js
```

The Node server serves Angular build output, exposes `/api/*` routes, and writes runtime user state separately from build-time castle content.

## Data Pipeline

Castle content is JSON-based. The active ingestion source is `source-data/topcastles/Topcastles export.xlsx`.

```bash
npm run data:convert           # Excel/CSV -> base JSON
npm run data:enrich:wikidata   # add Wikidata fields
npm run data:enrich:wikipedia  # add Wikipedia summaries
npm run data:lean              # derive lean castle JSON
npm run data:api               # regenerate new_app/public/api/
npm run data:sitemap           # regenerate new_app/public/sitemap.xml
npm run data:routes            # regenerate new_app/prerender-routes.txt
npm run build
```

After castle content changes, regenerate committed derived files before building. Do not edit `new_app/public/api/`, `new_app/public/sitemap.xml`, or `new_app/prerender-routes.txt` by hand unless the generated output is being repaired and the generator remains authoritative.

## Artifact Policy

[docs/pipeline.md](docs/pipeline.md) is the source of truth for artifact classification.

Keep these boundaries intact:

- Source and committed generated castle artifacts belong in git.
- `package-lock.json` files belong in git.
- `source-data/topcastles/Topcastles export.xlsx` remains the active ingestion source.
- `graphify-out/`, `dist/`, and `node_modules/` are generated or installed locally and must stay ignored.
- `data/users.json`, `runtime/`, and `local/` are runtime-like state and must stay ignored.
- Runtime code must not mutate prerendered HTML, JavaScript bundles, or other build artifacts in place.

## Developer Tooling

### Beads

This repo uses beads for issue tracking:

```bash
bd ready
bd show <id>
bd update <id> --claim
bd close <id>
bd prime
```

Beads data is synced with:

```bash
bd dolt push
```

### Graphify

Graphify builds an AI navigation graph in `graphify-out/`:

```bash
npm run graph:build
npm run graph:update
npm run graph:query CastleService
```

`graphify-out/` is tooling output and must not be committed. Agents use Graphify as the repo-structure authority; see [AGENTS.md](AGENTS.md).

### Context Pipeline

The local context pipeline creates bounded context bundles for agent work:

```bash
npm run context:index
npm run context:resolve -- <bead-id> --query "<focus>" --budget medium
```

Bundles are written under `data/context/` and are local ignored artifacts. The pipeline is documented in [docs/context-pipeline.md](docs/context-pipeline.md).

### Spec Kit

Topcastles uses Spec Kit as a lightweight policy layer for higher-risk work, not as a replacement for Beads, Graphify, or the context pipeline.

Use normal bead-based workflow for narrow fixes and docs updates. Use the fuller Spec Kit flow for PWA/service-worker work, admin API or admin UI work, rebuild-trigger workflows, NAS image-serving or runtime-boundary changes, and ADR-sensitive architecture changes. See [docs/spec-kit.md](docs/spec-kit.md) and [.specify/memory/constitution.md](.specify/memory/constitution.md).

### Storybook

```bash
npm run storybook
npm run build:storybook
```

## Preparing Safe Work For Agents

Use [AGENTS.md](AGENTS.md) as the agent contract. Keep prompts short and reference that file instead of pasting long workflow checklists.

A good agent handoff includes:

- one bead or an instruction to create one
- one clear goal
- explicit scope and non-goals
- exact files, symbols, or routes when known
- relevant architecture constraints
- required verification
- any known dirty files or shared-file risks

Do not ask agents to silently stash, revert, or absorb unrelated dirty files. If a task is higher-risk, say so and point to Spec Kit.

## Deployment

```bash
npm run deploy
```

The deployment script builds the app, builds and pushes the Docker image, and redeploys the single Node-based container on the NAS. See [docs/deployment.md](docs/deployment.md) for environment and SSH details.

## Documentation Map

| File | Authority |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Machine-agent workflow contract |
| [DEVELOPER.md](DEVELOPER.md) | Human developer workflow, setup, and handoff guide |
| [docs/architecture.md](docs/architecture.md) | Current architecture and runtime model |
| [docs/decisions.md](docs/decisions.md) | Architectural Decision Records |
| [docs/pipeline.md](docs/pipeline.md) | Artifact and generated-output policy |
| [docs/roadmap.md](docs/roadmap.md) | Active forward-looking worklist |
| [docs/product-strategy-plan.md](docs/product-strategy-plan.md) | Product direction and priority rationale |
| [docs/context-pipeline.md](docs/context-pipeline.md) | Context bundle pipeline reference |
| [docs/spec-kit.md](docs/spec-kit.md) | Higher-risk work policy |
| [docs/deployment.md](docs/deployment.md) | Deployment script and NAS setup |
| [docs/admin-readme.md](docs/admin-readme.md) | Protected editorial annex operator guide |
| [docs/new-developer-onboarding.md](docs/new-developer-onboarding.md) | First-day VS Code workflow |
| [docs/migration-report.md](docs/migration-report.md) | Historical modernization summary |
| [docs/setup.md](docs/setup.md) | Stack and tooling reference |
| [docs/modernization-plan.md](docs/modernization-plan.md) | Archive pointer to roadmap and migration report |
