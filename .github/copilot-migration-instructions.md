# WRK541 Project Guidelines

## Goal
- Migrate the database.
- Treat the PHP implementation and its tests as the functional baseline.

## Build and Test
- PHP app tests: ``
- New code build: ``
- New code  tests: ``
- Docs build: `cd docs && mkdocs build`

## Implementation Rules
- Prefer small, incremental changes.
- Add or modify one endpoint at a time and validate immediately.
- Keep JSON handling on the C# side with `System.Text.Json` unless a strong reason exists.
- Preserve endpoint names, routes, and response behavior unless the task explicitly changes them.
- Do not rewrite unrelated files while implementing migration steps.

## Verification Rules
- Before claiming completion, explain what was validated.
- When tests fail, identify whether the issue is in PHP source, new code implementation, or test assumptions.
- Prefer the narrowest relevant validation command first, then expand scope.

## Working Style
- Summarize expected behavior from the PHP source before making new code changes.
- Use focused edits that are easy to review and easy to roll back.
- When there is ambiguity, point to the source file or test that defines the current behavior.

