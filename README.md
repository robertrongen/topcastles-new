# Topcastles

Angular 19 castle-ranking website rebuilt from a legacy PHP app. It serves a ranked list of 1,000 castles with filtering, card/table views, per-castle detail pages, and JSON-backed user/favorites APIs.

The current production runtime is a single Docker container running the Node server in `server/index.js`. The Node server serves Angular build output, exposes `/api/*` endpoints, and stores runtime user state separately from build-time castle content.

## Quick Start

```bash
git clone https://github.com/robertrongen/topcastles
cd topcastles
npm run install:all
```

## Local Development

Run the API server and Angular dev server in separate terminals:

```bash
npm run dev:server
npm run dev:app
```

Open <http://localhost:4200>. The Angular dev server proxies `/api/*` requests to the Node server on port 3000.

## Key Commands

```bash
npm run build              # Angular build and prerender output
npm run start              # Angular dev server
npm run dev:server         # Node API/static runtime server
npm test                   # Angular unit tests
npm run data:api           # regenerate committed static API JSON
npm run data:sitemap       # regenerate committed sitemap
npm run data:routes        # regenerate committed prerender route list
npm run deploy             # build image and deploy to Synology NAS
```

## Documentation

- [DEVELOPER.md](DEVELOPER.md) - contributor workflow, setup, commands, and tooling.
- [docs/architecture.md](docs/architecture.md) - current system design and runtime model.
- [docs/pipeline.md](docs/pipeline.md) - artifact policy for source, generated, and runtime files.
- [docs/roadmap.md](docs/roadmap.md) - active forward-looking worklist.
- [docs/migration-report.md](docs/migration-report.md) - historical modernization summary.
