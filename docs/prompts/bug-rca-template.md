# Bug RCA Prompt Template

Use this for non-trivial bugs or regressions where we need a short root-cause writeup before or alongside the fix.

```md
You are working in the Topcastles repository.

Task
- Bead ID: <topcastles-xxx>
- Bug summary: <one-sentence description>
- Affected area: <Angular app, Node server, data pipeline, deployment, docs/tooling>
- Non-goals: <explicit exclusions>

Follow these repo authorities:
- Beads for task tracking
- Graphify before broad file reading
- `data/context/bundles/<id>.json` for injected repo context
- `.specify/memory/constitution.md` for governing rules

Produce a compact RCA with:
1. Reproduction steps
2. Expected vs actual behavior
3. Primary cause
4. Contributing factors
5. Fix approach
6. Regression risk
7. Verification plan
8. Prevention or follow-up beads

Keep it practical:
- prefer file/symbol evidence over speculation
- include only the affected runtime/build boundaries
- keep the writeup short unless the bug is architecture-sensitive
```
