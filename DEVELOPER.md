# Developer Guide — Topcastles

Full reference for contributors. For a project overview see [README.md](README.md).

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| npm | ≥ 9 | Package manager |
| Python | ≥ 3.9 | Data pipeline scripts |
| Docker | any | Container builds |
| bash | any | `deploy.sh` |

## Setup

```bash
git clone https://github.com/robertrongen/topcastles
cd topcastles
npm run install:all       # installs deps in new_app/ and scripts/
```

### Install developer tooling (one-time, system-wide)

**beads** — task tracking CLI:

```bash
npm install -g @beads/bd
bd init                   # run from repo root — sets up hooks and CLAUDE.md integration
```

**graphify** — codebase navigation graph for AI agents:

```bash
npm install -g graphify-ts   # installs the graphify binary
graphify build .             # generate the knowledge graph (graphify-out/graph.json)
graphify hook install        # install stop hook to auto-update graph after each session
```

After running `graphify build .` once, the graph stays up to date automatically via the stop hook. To update manually: `npm run graph:build` or `npm run graph:update`.

## Commands

All commands run from the **repo root**.

### Development

```bash
npm start                  # dev server → http://localhost:4200 (HMR enabled)
npm run build:watch        # dev build with file watching
```

### Production build

```bash
npm run build              # SSR + prerendered output → new_app/dist/new_app/
npm run serve:ssr          # run the SSR Express server (requires prior build)
```

### Testing

```bash
npm test                   # unit tests with Karma + Jasmine (opens Chrome)
```

### Component explorer

```bash
npm run storybook          # Storybook 9 → http://localhost:6006
npm run build:storybook    # build static Storybook site
```

### Data pipeline

Castle data lives in `new_app/src/assets/data/castles_enriched.json`. To regenerate:

```bash
npm run data:convert           # Excel/CSV → base JSON (scripts/xlsx_to_json.py)
npm run data:enrich:wikidata   # add Wikidata fields
npm run data:enrich:wikipedia  # add Wikipedia summaries
npm run data:api               # regenerate static JSON API under new_app/src/assets/api/
```

### MCP server

```bash
npm run mcp                # start the Model Context Protocol server (scripts/mcp-server.js)
```

### Knowledge graph (graphify)

```bash
npm run graph:build        # full rebuild of graphify-out/graph.json
npm run graph:update       # fast incremental update after editing files
npm run graph:query <sym>  # look up a symbol — e.g. npm run graph:query CastleService
```

The graph is auto-updated at the end of each Claude Code session via a stop hook.

### Deployment

```bash
npm run deploy             # build → Docker image → push to Docker Hub → redeploy on NAS
```

See [docs/deployment.md](docs/deployment.md) for SSH prerequisites and NAS configuration.

## Architecture

```
topcastles/
├── new_app/                   Angular 19 application
│   ├── src/
│   │   ├── app/               Components, services, routes
│   │   │   ├── castle-list/   List view with filters and sorting
│   │   │   ├── castle-detail/ Detail page with Leaflet map
│   │   │   └── ...
│   │   ├── assets/data/       Static JSON castle data
│   │   ├── main.ts            Browser bootstrap
│   │   ├── main.server.ts     SSR bootstrap
│   │   └── server.ts          Express server config
│   └── dist/new_app/          Build output (gitignored)
├── scripts/                   Data pipeline utilities
│   ├── xlsx_to_json.py        Source data conversion
│   ├── enrich_wikidata.js     Wikidata enrichment
│   ├── enrich_wikipedia.js    Wikipedia enrichment
│   ├── generate_api.js        Static API generation
│   └── mcp-server.js          MCP server
├── old_app/                   Legacy PHP source (reference only, do not modify)
├── docs/                      Documentation
├── graphify-out/              AI navigation graph (auto-generated)
├── Dockerfile                 Multi-stage Node Alpine build
├── deploy.sh                  One-command deployment script
└── package.json               Root workspace (proxies all commands above)
```

## Key architecture decisions

- **Standalone components** — no NgModules; each component declares its own imports
- **Signals** — used for reactive state instead of RxJS Subjects where possible
- **SSR + prerendering** — all castle routes are prerendered at build time for SEO
- **Static JSON API** — no backend; data is embedded as static assets and served by the Express SSR server or CDN
- **Single Docker image** — the Express SSR server serves both the prerendered HTML and the API JSON

See [docs/decisions.md](docs/decisions.md) for full ADRs and [docs/architecture.md](docs/architecture.md) for component diagrams.

## Developer tooling

| Tool | Config | Purpose |
|------|--------|---------|
| [beads](https://github.com/gastownhall/beads) | `.beads/` | Issue tracking — use `bd ready` / `bd create` / `bd close` |
| [graphify](https://github.com/safishamsi/graphify) | `graphify-out/` | Codebase navigation graph for AI agents |
| Storybook 9 | `.storybook/` | Component development and visual testing |
| Compodoc | `new_app/` | API documentation generation |
| Karma + Jasmine | `karma.conf.js` | Unit testing |

### beads — issue tracking

beads stores issues in a local Dolt database (`.beads/`) synced to a remote repo. Claude Code automatically loads task context at session start via the `SessionStart` hook.

```bash
bd ready                                          # list issues with no open blockers
bd create --title="..." --type=feature --priority=2  # file a new issue (priority: 0=critical → 4=backlog)
bd update <id> --claim                            # assign to yourself and start working
bd show <id>                                      # view full issue details and dependencies
bd close <id>                                     # mark done
bd dep add <child-id> <parent-id>                 # link issues hierarchically
bd remember "useful insight"                      # persist a note across sessions
bd memories <keyword>                             # search persisted notes
bd prime                                          # print full workflow context (runs automatically at session start)
```

### graphify — codebase navigation graph

graphify indexes all source files into a symbol graph (`graphify-out/graph.json`). Claude Code reads this instead of scanning raw files, reducing token spend on codebase exploration. A PreToolUse hook fires on every file search to remind the AI to use the graph first.

```bash
npm run graph:build                    # full rebuild (6 926 files, 3 540 symbols)
npm run graph:update                   # fast incremental update via git diff
npm run graph:query CastleService      # look up a symbol and its relationships
```

The graph auto-updates at the end of every Claude Code session via the stop hook installed by `graphify hook install`.

## Documentation index

| File | Contents |
|------|---------|
| [docs/architecture.md](docs/architecture.md) | System design and component structure |
| [docs/decisions.md](docs/decisions.md) | Architectural Decision Records (ADRs) |
| [docs/deployment.md](docs/deployment.md) | Deployment script and Synology NAS setup |
| [docs/pipeline.md](docs/pipeline.md) | Build and CI pipeline steps |
| [docs/setup.md](docs/setup.md) | Stack and tooling reference |
| [docs/migration-report.md](docs/migration-report.md) | PHP → Angular migration summary |
| [docs/modernization-plan.md](docs/modernization-plan.md) | Planned improvements |
