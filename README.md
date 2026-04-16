# For Claude/agent workflow (approval-gated)

```bash
# 1. Read docs first (required)
# 2. Fetch and summarize feature/user stories
# 3. Create LOCAL branch (do not push)
# 4. Implement with local commits
# 5. Update docs if behavior changed
# 6. Build plugin
[command, e.g.: pnpm turbo build]

# 7. Publish to yalc (APPROVAL GATE)
[command, e.g.: npx yalc publish]

# 8. Run backend for validation
[command, e.g.: pnpm dev]

# 9. Agent stops and reports (no git push yet)
# 10. Wait for explicit approval
# 11. Only after approval: git push -u origin <branch>
```

See [docs/development-workflow.md](docs/development-workflow.md) for full development details.

## Documentation

- [docs/README.md](docs/README.md) — Documentation index
- [docs/architecture.md](docs/architecture.md) — System design and package boundaries
- [docs/development-workflow.md](docs/development-workflow.md) — Local development guide
- [docs/testing.md](docs/testing.md) — Testing strategy
- [docs/troubleshooting.md](docs/troubleshooting.md) — Common issues and debugging
- [docs/deployment-architecture.md](docs/deployment-architecture.md) — Production deployment model (planned)
- [docs/release-process.md](docs/release-process.md) — Release workflow

## Repository info

- **Azure DevOps Organization:** `ORG`
- **Azure DevOps Project:** `PROJECT`
- **Repository:** `REPO`
- **Default branch:** `main`
