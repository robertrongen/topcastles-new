
# Architecture

> Target framework and architectural decisions are TBD. This document will be updated once the migration stack is chosen. See `docs/decisions.md` for decisions as they are made.

## Source application

The legacy application lives in `old_app/` and is a PHP website with:

- Server-rendered PHP pages with MySQL backend
- Bilingual content (NL/EN) under `old_app/content/`
- Static assets under `old_app/images/` and `old_app/style/`
- Form handling under `old_app/forms/` and shared logic under `old_app/functions/`

## New application

> To be defined. See `docs/decisions.md`.