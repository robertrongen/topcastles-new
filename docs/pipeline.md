# Pipeline

> Stack: Angular 19 + Storybook (ADR-002). See `docs/setup.md` for full tooling.

## Environments

| Environment | Purpose            | URL                                           |
| ----------- | ------------------ | --------------------------------------------- |
| dev         | Local development  | `http://localhost:4200` (`npm start`)         |
| storybook   | Component dev      | `http://localhost:6006` (`npm run storybook`) |
| prod        | Docker on Synology | `http://<synology-ip>:8080` (ADR-004)         |

## Pipeline steps

### 1. Install

```bash
npm ci
```

### 2. Lint

```bash
ng lint
npx prettier --check .
```

### 3. Unit tests

```bash
ng test --watch=false --browsers=ChromeHeadless
```

### 4. Build

```bash
ng build --configuration=production
```

Produces optimized bundles in `dist/new_app/`. Includes prerendering for all static routes.

### 5. Storybook build

```bash
npm run build-storybook
```

### 6. Docker build

```bash
docker build -t hobunror/hobunror:latest .
```

Multi-stage build: Node build stage + Node Alpine runtime stage.

### 7. Deploy to Synology

```bash
bash deploy.sh
```

Builds the app, builds and pushes the Docker image to Docker Hub, then pulls and restarts the container on the NAS over SSH. See `docs/deployment.md` for full details.

## Local development workflow

```bash
npm install          # one-time setup
npm run storybook    # build components in isolation
npm start            # run the full app locally
npm test             # run unit tests in watch mode
```

## Data pipeline (on-demand)

```bash
python scripts/csv_to_json.py
```

Converts `old_app/database/Topcastles export.csv` to JSON files in `new_app/src/assets/data/`. Run manually when castle data changes. See ADR-003.
