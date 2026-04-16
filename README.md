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

## Repository info

- **Default branch:** `main`
- **Source application:** `old_app/` (PHP)
