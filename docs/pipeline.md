# Pipeline

> Stack: Angular 19 + Storybook + Playwright (ADR-002). See `docs/setup.md` for full tooling.

## Environments

| Environment | Purpose | URL |
|---|---|---|
| dev | Local development | `http://localhost:4200` (ng serve) |
| storybook | Component development | `http://localhost:6006` (npm run storybook) |
| prod | Production build | TBD (static hosting or Node SSR) |

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

### 8. Deploy
TBD — depends on hosting choice. Options:
- **Static hosting** (e.g., Azure Static Web Apps, Netlify): Deploy `dist/` output directly
- **Node SSR** (e.g., Azure App Service): Deploy the SSR server bundle

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
python scripts/export_data.py    # MySQL dump → JSON files in new_app/src/assets/data/
```
This is not part of CI — it runs manually when castle data changes. See ADR-003.