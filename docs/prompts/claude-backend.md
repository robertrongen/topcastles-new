# Claude prompt: backend

Implement the backend in `apps/keyshot-proxy-api` and supporting client logic in `packages/keyshot-client`.

Rules:
- Read relevant docs first before implementing
- use TypeScript
- use Fastify in the backend
- backend reads KeyShot credentials from env
- backend is the only place that authenticates with KeyShot
- implement token caching and refresh-before-expiry
- retry once after token refresh on 401
- normalize responses to match `docs/api-contract.md`
- update docs if implementation changes behavior or contracts
- do not invent endpoints; keep behavior grounded in the docs and discovered working API calls
- after implementation, follow the approval-gated workflow (see `docs/README.md`)
