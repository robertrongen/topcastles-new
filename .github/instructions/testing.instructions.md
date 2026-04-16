---
description: "Use when running tests, parity validation, regression checks, debugging failing tests, or comparing PHP and new-code behavior."
name: "Testing and Parity Validation"
---

# Testing Rules

- Run the smallest relevant test set first, then broaden scope.
- Prefer reproducing failures with a single page or endpoint before changing code.
- Report exact failing commands and summarize the failure reason in plain language.
- If new-code behavior intentionally differs from the PHP baseline, call it out explicitly instead of silently adapting tests.
- Do not mark a migration step complete without at least one concrete validation step.
