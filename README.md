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
npm run data:regenerate    # canonical content pipeline; regenerates committed artifacts
npm run build              # required after content changes to refresh prerendered output
npm run data:api           # regenerate committed static API JSON
npm run data:sitemap       # regenerate committed sitemap
npm run data:routes        # regenerate committed prerender route list
npm run deploy             # build image and deploy to Synology NAS
```

When source content changes, update the canonical spreadsheet source, run `npm run data:regenerate`, then run `npm run build`. Do not hand-edit generated JSON, sitemap, or prerender-route artifacts except as an emergency that is immediately regenerated through the pipeline.

## Installing as an App

Topcastles supports installation as a standalone app on desktop and mobile.

**Desktop (Chrome / Edge)**

Open the site and look for the install icon (⊕) in the browser address bar, or
open the browser menu and choose **Install Topcastles**. The app opens in its own
window without browser chrome.

**Android (Chrome)**

Tap the browser menu → **Add to Home screen**. The app icon appears on your home
screen and opens in standalone mode.

**iOS (Safari)**

Tap the Share button → **Add to Home Screen**. Safari does not show an install
prompt automatically — the Share sheet is the only way.

**What works offline**

Once the app has been opened at least once, the following are available without
a network connection:

- All app pages (home, castle list, castle detail, countries, top 100, etc.)
- The full castle dataset (`castles.json`)

**What requires a network connection**

- Castle photos — these are served from the NAS and are not cached by the app.
  Photo areas will be blank when offline.
- Favorites and user data — these are stored on the server and require network
  access to load or save.

**Updates**

When a new version is deployed, the app updates itself silently in the background
on the next visit. No reinstall or manual refresh is needed.

## Documentation

- [docs/new-developer-onboarding.md](docs/new-developer-onboarding.md) - quick start workflow for new contributors in VS Code.
- [DEVELOPER.md](DEVELOPER.md) - contributor workflow, setup, commands, and tooling.
- [docs/spec-kit.md](docs/spec-kit.md) - when to use lightweight workflow versus fuller Spec Kit discipline.
- [docs/architecture.md](docs/architecture.md) - current system design and runtime model.
- [docs/pipeline.md](docs/pipeline.md) - artifact policy for source, generated, and runtime files.
- [docs/roadmap.md](docs/roadmap.md) - active forward-looking worklist.
- [docs/migration-report.md](docs/migration-report.md) - historical modernization summary.
