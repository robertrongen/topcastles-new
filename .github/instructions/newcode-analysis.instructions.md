---
description: "Use when analyzing PHP source files, form handlers, query logic, response behavior, or migration parity from PHP to the target framework."
name: "PHP Source Analysis"
applyTo: "old_app/**/*.php"
---

# PHP Source Analysis Rules

- Treat the PHP implementation as the behavioral source of truth.
- Extract routes (form actions, `$_GET`/`$_POST` parameters), response shapes (HTML output), database queries, and session/cookie usage before proposing new-code changes.
- Read the relevant `old_app/forms/` and `old_app/functions/` files before suggesting implementation order.
- Separate confirmed behavior from assumptions in summaries.
- If behavior is unclear, point to the exact PHP file and line that needs review.
