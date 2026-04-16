# Pipeline

> Stack: Angular 19 + Storybook + Playwright (ADR-002). See `docs/setup.md` for full tooling.

## Environments

| Environment | Purpose | URL |
|---|---|---|
| dev | Local development | `http://localhost:4200` (ng serve) |
| storybook | Component development | `http://localhost:6006` (npm run storybook) |
| prod | Docker container on Synology NAS | `http://<synology-ip>:4000` (ADR-004) |

## Pipeline steps

### 1. Install
```bash
npm ci                        # Clean install from lockfile (deterministic)
```

### 2. Lint
```bash
ng lint                       # ESLint with @angular-eslint rules
npx prettier --check .        # Formatting check
```
**What this catches**: TypeScript errors, Angular-specific anti-patterns, inconsistent formatting.

### 3. Unit tests
```bash
ng test --watch=false --browsers=ChromeHeadless
```
**What this runs**: Karma + Jasmine specs for components and services. Each migration slice
should include unit tests for its service logic and basic component rendering.

### 4. Build
```bash
ng build --configuration=production
```
**What this produces**: Optimized bundles in `dist/new_app/`. Angular AOT (Ahead-of-Time)
compilation catches template errors at build time — this is a major advantage over the PHP
app where errors only surface at runtime.

### 5. Prerender (SSR)
```bash
ng build --configuration=production    # includes prerendering if configured in angular.json
```
**What this does**: Generates static HTML for all known routes. This step reads the castle
JSON data and produces pre-rendered pages for SEO. See `docs/architecture.md` for prerender strategy.

### 6. Storybook build
```bash
npm run build-storybook       # Static Storybook export
```
**What this produces**: A standalone static site documenting all components with interactive examples.

### 7. E2E tests
```bash
npx playwright test
```
**What this validates**: Full browser tests that verify migration parity against PHP baseline
behavior (routes, content, query parameters). E2E tests run against the production build.

### 8. Docker build
```bash
docker build -t topkastelen:latest .    # Multi-stage: build + Node Alpine runtime
```
**What this produces**: A lightweight Docker image (~150-200 MB) containing the Angular SSR
server and all prerendered static assets. Uses multi-stage build to keep the image small.

### 9. Deploy to Synology
```bash
# Option A: Direct transfer
docker save topkastelen:latest | gzip > topkastelen.tar.gz
# Copy to Synology, then:
docker load < topkastelen.tar.gz
docker run -d -p 4000:4000 --name topkastelen --restart unless-stopped topkastelen:latest

# Option B: Via Docker registry (if configured)
docker push <registry>/topkastelen:latest
# On Synology Container Manager: pull and run
```
**What this does**: Runs the Angular SSR app as a persistent container on the Synology NAS.
The `--restart unless-stopped` flag ensures the container restarts after NAS reboots.

## Local development workflow

```
npm install          →  one-time setup
npm run storybook    →  build components in isolation
ng serve             →  run the full app locally
ng test              →  run unit tests in watch mode
npx playwright test  →  validate parity with PHP baseline
```

## Data pipeline (one-time / on-demand)

```bash
python scripts/csv_to_json.py    # CSV → JSON files in new_app/src/assets/data/
```
This is not part of CI — it runs manually when castle data changes. See ADR-003.