# Topcastles

Angular 19 castle-ranking website, rebuilt from a legacy PHP app. Serves a ranked list of 1000 European castles with filtering, card/table views, and per-castle detail pages.

**Live:** deployed as a Docker container on a Synology NAS via `deploy.sh`.

## Tech stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Angular 19 - Standalone Components, Signals, SSR             |
| UI             | Angular Material 19                                           |
| Styling        | SCSS with legacy brand palette                                |
| Data           | Static JSON (generated from CSV at `scripts/csv_to_json.py`) |
| Rendering      | Angular SSR + prerendering for SEO                            |
| Container      | Docker (Node Alpine), deployed to Synology NAS                |
| Component docs | Storybook 9                                                   |

## Quick start

```bash
cd new_app
npm install
npm start          # dev server → http://localhost:4200
```

## Commands

```bash
# Build
npm run build                  # production build (SSR + prerender)
npm run watch                  # dev build with file watching

# Test
npm test                       # unit tests (Karma + Jasmine, opens Chrome)

# Run
npm start                      # development server at http://localhost:4200
npm run serve:ssr:new_app      # production SSR server (after build)

# Storybook
npm run storybook              # component explorer at http://localhost:6006
npm run build-storybook        # build static Storybook site
```

Output goes to `new_app/dist/new_app/`.

## Deployment

```bash
bash deploy.sh
```

Builds the Angular app, builds a Docker image, pushes to Docker Hub, and redeploys the container on the Synology NAS over SSH. See [docs/deployment.md](docs/deployment.md) for prerequisites and troubleshooting.

## Data

Castle data lives in `new_app/src/assets/data/` as static JSON. To regenerate from the source CSV:

```bash
python scripts/csv_to_json.py
```

## Documentation

- [docs/architecture.md](docs/architecture.md) — system design and component structure
- [docs/decisions.md](docs/decisions.md) — architectural decisions (ADRs)
- [docs/deployment.md](docs/deployment.md) — deployment script and Synology NAS setup
- [docs/pipeline.md](docs/pipeline.md) — build and CI pipeline steps
- [docs/setup.md](docs/setup.md) — stack and tooling reference
- [docs/migration-report.md](docs/migration-report.md) — summary of the PHP→Angular migration

## Repository layout

```
new_app/       Angular 19 application
old_app/       Legacy PHP source (reference only)
scripts/       CSV → JSON data conversion
docs/          Project documentation
deploy.sh      Deployment script
Dockerfile     Multi-stage Docker build
```
