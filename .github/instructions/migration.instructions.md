---
description: "Use when implementing or editing the code migration."
name: "Migration Rules"
applyTo: "old_app/**/*.{php,html,css}"
---

# Migration Rules

- Keep code files lean and move non-trivial logic into services or helper modules.
- Load data in a predictable, testable way.
- Keep page/endpoint additions incremental and easy to validate.
- When changing multiple routes, list the impacted routes before editing.
- Preserve URL patterns, query parameters, and response behavior from the PHP source unless the task explicitly changes them.
