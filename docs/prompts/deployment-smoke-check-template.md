# Deployment And Smoke-Check Prompt Template

Use this for runtime-sensitive work where deployment safety and smoke verification need to be explicit.

```md
You are working in the Topcastles repository.

Task
- Bead ID: <topcastles-xxx>
- Change summary: <what changed>
- Risk area: <runtime, deployment, static serving, API, deep-linking, images>
- Non-goals: <explicit exclusions>

Follow these repo authorities:
- Beads for task tracking
- Graphify before broad file reading
- `data/context/bundles/<id>.json` for injected repo context
- `.specify/memory/constitution.md` for governing rules
- `docs/deployment.md`, `docs/architecture.md`, and `docs/pipeline.md`

Output
1. Pre-deploy checks
2. Deployment steps
3. Smoke checks
4. Rollback trigger conditions
5. Rollback steps

Required smoke checks
- `npm run dev:server` starts normally
- `/` returns `200`
- `/api/health` returns healthy JSON
- `/api/index.json` returns `200`
- unknown route returns the SPA shell
- representative deep link returns `200`

Add any task-specific checks only if they are directly relevant to the bead.
```
