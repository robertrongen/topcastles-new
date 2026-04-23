# Task Implementation Prompt Template

Copy, fill placeholders, and use as the default prompt for Codex/Claude-style agents.

```md
You are working in the Topcastles repository.

Task
- Bead ID: <topcastles-xxx>
- Goal: <one clear outcome>
- Out of scope: <explicit exclusions>

Mandatory workflow
1. Bead-first:
   - Run `bd ready`, `bd show <id>`, `bd update <id> --claim`.
2. Graphify-first:
   - Run `graphify query graphify-out/graph.json <symbol>` (or repo script equivalent) before broad file navigation.
3. UCM-style minimal context before coding:
   - Run `npm run context:index`.
   - Run `npm run context:resolve -- <id> --query "<focused query>" --budget medium`.
   - Use the resulting `data/context/bundles/<id>.json` as primary injected context.

Architecture constraints
- Respect ADRs and modernization phases in docs.
- No database additions.
- No external services.
- No embeddings/vector databases.
- No multi-container setup.
- No runtime behavior changes unless explicitly required.
- Avoid broad refactors and unrelated edits.

Implementation expectations
- Keep scope incremental and reviewable.
- Touch only files needed for this bead.
- Preserve unrelated dirty worktree changes.

Verification checklist (required)
1. `npm test`
2. `npm run build`
3. Server starts (`npm run dev:server`)
4. `/` returns 200
5. `/api/health` is healthy
6. `/api/index.json` returns 200
7. Unknown SPA route returns app shell
8. Representative deep link returns 200
9. Run any added helper/tasks once

Session completion (required)
1. `bd close <id>`
2. `git pull --rebase`
3. `bd dolt push`
4. `git push`
5. Confirm `git status` is up to date with origin.

Output format
1. Summary of changes
2. Files created/modified
3. What a new developer should do first in VS Code
4. Limitations intentionally left for later
5. Confirmation runtime behavior is unchanged
6. Exact verification commands used
```
