# High-Risk Roadmap Prompt Template

Use this only for architecture-sensitive roadmap work. Keep the prompt short and let repo docs carry the reusable guidance.

```md
You are working in the Topcastles repository.

Task
- Bead ID: <topcastles-xxx>
- Goal: <one clear outcome>
- Non-goals: <explicit exclusions>

Follow these repo authorities:
- Beads for task status
- Graphify for structure lookup before broad file reading
- `data/context/bundles/<id>.json` for injected repo context
- `.specify/memory/constitution.md` for governing rules

Required flow
1. `bd show <id>` and `bd update <id> --claim`
2. `npm run graph:query -- <symbol>`
3. `npm run context:index`
4. `npm run context:resolve -- <id> --query "<focused query>" --budget medium`
5. Run fuller Spec Kit discipline before implementation: specify, clarify, plan, tasks, analyze

Architecture-sensitive checks
- Preserve JSON-only architecture
- Preserve `/data` runtime state vs `/assets/data` build-time content
- Do not mutate prerendered/build artifacts at runtime
- Preserve single-container Node runtime and Angular Signals defaults

Verification
- `npm test`
- `npm run build`
- `npm run dev:server`
- Verify `/`, `/api/health`, `/api/index.json`, SPA fallback, and a representative deep link
```
