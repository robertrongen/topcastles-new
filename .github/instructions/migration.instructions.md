---
description: "Use when implementing or editing the code migration."
name: "Migration Rules"
applyTo: "old_app/**/*.{php,html,css---}"
---

# Migration Rules

- Use ASP.NET Core Minimal APIs.
- Keep the code files lean and move non-trivial logic into services or helper types.
- Prefer descriptive DTO names and avoid anonymous objects except for trivial root responses.
- Load data in a predictable, testable way.
- Keep endpoint additions incremental and easy to validate.
- When changing multiple endpoints, list the impacted routes before editing.
