# topkastelen

Migration of a legacy PHP castle-ranking website to a modern framework.

## Agent workflow (approval-gated)

```bash
# 1. Read docs/ first (required)
# 2. Create LOCAL branch — do not push to origin yet
# 3. Implement with local commits
# 4. Update docs if behavior or architecture changed
# 5. Build and test (commands TBD once stack is chosen)
# 6. Agent STOPS and reports — no git push yet
# 7. Wait for explicit approval
# 8. Only after approval: git push -u origin <branch>
```

## Documentation

- [docs/README.md](docs/README.md) — Documentation index
- [docs/architecture.md](docs/architecture.md) — System design and package boundaries
- [docs/decisions.md](docs/decisions.md) — Architectural decisions
- [docs/pipeline.md](docs/pipeline.md) — CI/CD pipeline
- [docs/setup.md](docs/setup.md) — Stack and tooling
- [plan/migration.md](plan/migration.md) — Migration plan

## New App — Build, Test & Run

The Angular application lives in `new_app/`. All commands below assume you are in that directory.

```bash
cd new_app
npm install
```

### Build

```bash
# Production build (SSR + prerender)
npm run build

# Development build with file watching
npm run watch
```

Output goes to `new_app/dist/new_app/`.

### Test

```bash
# Unit tests (Karma + Jasmine, opens Chrome)
npm test
```

### Run

```bash
# Development server (http://localhost:4200)
npm start

# Production SSR server (after build)
npm run serve:ssr:new_app
```

### Storybook

```bash
# Launch Storybook component explorer
npm run storybook

# Build static Storybook site
npm run build-storybook
```

### PHP baseline tests (Python)

From the repository root (requires a Python venv with `pytest`):

```bash
pytest tests/
```

## Repository info

- **Default branch:** `main`
- **Source application:** `old_app/` (PHP)
- **New application:** `new_app/` (Angular 19 + SSR)
