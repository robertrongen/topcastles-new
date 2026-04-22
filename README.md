# Topcastles

Angular 19 castle-ranking website, rebuilt from a legacy PHP app. Serves a ranked list of 1,000 European castles with filtering, card/table views, and per-castle detail pages.

**Live:** deployed as a Docker container on a Synology NAS via `deploy.sh`.

## Tech stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Angular 19 — Standalone Components, Signals, SSR              |
| UI             | Angular Material 19                                           |
| Styling        | SCSS with legacy brand palette                                |
| Data           | Static JSON in `new_app/src/assets/data/`                     |
| Rendering      | Angular SSR + prerendering for SEO                            |
| Container      | Docker (Node Alpine), deployed to Synology NAS                |
| Component docs | Storybook 9                                                   |

## Quick start

```bash
git clone https://github.com/robertrongen/topcastles
cd topcastles
npm run install:all    # installs deps in new_app/, scripts/, and server/
```

## Local dev

The app has two processes that run together:

| Process | Command | Port | Purpose |
| --- | --- | --- | --- |
| Node API server | `npm run dev:server` | 3000 | `/api/*` routes, user + favorites data |
| Angular dev server | `npm run dev:app` | 4200 | UI with hot reload |

Run each in a separate terminal:

```bash
# Terminal 1 — API server (from project root)
npm run dev:server

# Terminal 2 — Angular dev server (from project root)
npm run dev:app
```

Then open <http://localhost:4200>. The Angular dev server proxies `/api/*` requests to port 3000 automatically (`new_app/proxy.conf.json`).

> **Without the API server:** the app still loads but user/favorites features will silently fail (no error shown — this is intentional for offline dev).

## Deploy

```bash
npm run deploy         # build → Docker image → push to Docker Hub → redeploy on NAS
```

## Developer guide

Full setup, commands, data pipeline, architecture, and AI tooling (beads + graphify) are in [DEVELOPER.md](DEVELOPER.md).
