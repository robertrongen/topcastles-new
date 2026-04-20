# Topcastles

Angular 19 castle-ranking website, rebuilt from a legacy PHP app. Serves a ranked list of 1,000 European castles with filtering, card/table views, and per-castle detail pages.

**Live:** deployed as a Docker container on a Synology NAS via `deploy.sh`.

## Tech stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Angular 19 — Standalone Components, Signals, SSR             |
| UI             | Angular Material 19                                           |
| Styling        | SCSS with legacy brand palette                                |
| Data           | Static JSON in `new_app/src/assets/data/`                    |
| Rendering      | Angular SSR + prerendering for SEO                            |
| Container      | Docker (Node Alpine), deployed to Synology NAS                |
| Component docs | Storybook 9                                                   |

## Quick start

```bash
git clone https://github.com/robertrongen/topcastles
cd topcastles
npm run install:all    # installs deps in new_app/ and scripts/
npm start              # dev server → http://localhost:4200
```

## Deploy

```bash
npm run deploy         # build → Docker image → push to Docker Hub → redeploy on NAS
```

## Developer guide

Full setup, commands, data pipeline, architecture, and AI tooling (beads + graphify) are in [DEVELOPER.md](DEVELOPER.md).
