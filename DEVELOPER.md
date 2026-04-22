# Developer Guide - Topcastles

Contributor workflow reference. For the project overview see [README.md](README.md). For the source/generated/runtime artifact policy see [docs/pipeline.md](docs/pipeline.md).

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 18 | App, scripts, and server runtime |
| npm | >= 9 | Package manager |
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

Run the Node API server and Angular dev server in separate terminals:

```bash
npm run dev:server
npm run dev:app
```

Open <http://localhost:4200>. The Angular dev server proxies `/api/*` requests to the Node server on port 3000. For UI-only work, `npm start` is equivalent to `npm run dev:app`.

## Build And Test

```bash
npm run build
npm test
npm test -- --watch=false --browsers=ChromeHeadless
```

`npm run build` produces Angular build and prerender output under `new_app/dist/new_app/`. That output is ignored and should be recreated rather than committed.

## Runtime Server

The production container runs `node server/index.js`. The Node server serves Angular build output, exposes `/api/*` routes, and writes runtime user state separately from build-time castle content.

Useful local checks:

```bash
npm run dev:server
curl http://localhost:3000/api/health
```

## Data Pipeline

Castle content is JSON-based. The legacy ingestion source is still `old_app/database/`.

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

After changes to castle content, regenerate the committed derived files before building. Do not edit `new_app/public/api/`, `new_app/public/sitemap.xml`, or `new_app/prerender-routes.txt` by hand unless the generated output is being repaired and the generator stays authoritative.

## Artifact Policy

[docs/pipeline.md](docs/pipeline.md) is the source of truth for artifact classification.

Keep these boundaries intact:

- Source and committed generated castle artifacts belong in git.
- `package-lock.json` files belong in git.
- `old_app/database/` remains a source dependency for ingestion.
- `graphify-out/`, `dist/`, and `node_modules/` are generated or installed locally and must stay ignored.
- `data/users.json`, `runtime/`, and `local/` are runtime-like state and must stay ignored.
- Runtime code must not mutate prerendered HTML, JavaScript bundles, or other build artifacts in place.

## Developer Tooling

### beads

This repo uses beads for issue tracking:

```bash
bd ready
bd show <id>
bd update <id> --claim
bd close <id>
bd prime
```

beads data is synced with `bd dolt push`.

### graphify

graphify builds an AI navigation graph in `graphify-out/`:

```bash
npm run graph:build
npm run graph:update
npm run graph:query CastleService
```

`graphify-out/` is tooling output and must not be committed.

### Storybook

```bash
npm run storybook
npm run build:storybook
```

## Deployment

```bash
npm run deploy
```

The deployment script builds the app, builds and pushes the Docker image, and redeploys the single Node-based container on the NAS. See [docs/deployment.md](docs/deployment.md) for environment and SSH details.

## Documentation Index

| File | Contents |
|------|----------|
| [docs/architecture.md](docs/architecture.md) | Current architecture and runtime model |
| [docs/decisions.md](docs/decisions.md) | Architectural Decision Records |
| [docs/deployment.md](docs/deployment.md) | Deployment script and NAS setup |
| [docs/pipeline.md](docs/pipeline.md) | Artifact policy |
| [docs/setup.md](docs/setup.md) | Stack and tooling reference |
| [docs/modernization-plan.md](docs/modernization-plan.md) | Historical and planned modernization work |
