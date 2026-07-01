# GFOS Core — Enterprise API

A Deno-based enterprise API for customer relationship management with strict architecture enforcement, clean code, and comprehensive testing.

## Quick Start

### Prerequisites
- Deno v1.x+
- PostgreSQL (optional, for DB operations)

### Setup

1. Clone the repo:
```bash
git clone https://github.com/hossamnassem22/gfos-core.git
cd gfos-core
```

2. Set environment variables (optional, for DB):
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/gfos"
```

3. Run locally:
```bash
deno run --allow-net --allow-read src/server.ts
```

Server starts on `http://localhost:3000` by default.

### Run Tests

Non-DB tests (no DATABASE_URL required):
```bash
deno test --allow-all --filter "^(?!.*\bdb\b).*"
```

All tests (with DATABASE_URL):
```bash
DATABASE_URL="postgresql://..." deno test --allow-all
```

Lint and type-check:
```bash
deno lint
deno check src/server.ts
```

### Run Migrations

If DATABASE_URL is set:
```bash
chmod +x ./scripts/migrate.sh
./scripts/migrate.sh
```

## API Endpoints

- **GET /health** — Health check, returns `{ status: "ok", time: "ISO8601" }`
- **POST /api/customers** — Create a customer (requires JSON body with `name` field; optional `email` and `phone`)
  - Response: `201 Created` with customer object or `{ persisted: false }` if DB not configured

## Architecture

- **src/server.ts** — Main HTTP handler
- **src/db/client.ts** — Database pool and query wrapper (lazy-initialized)
- **src/db/customerRepository.ts** — Customer CRUD operations
- **scripts/architecture/** — Architecture validation engine (Deno-native, no ts-morph)
- **tests/** — Deno tests for handlers, DB, and architecture rules
- **.github/workflows/** — CI/CD pipelines (lint, type-check, tests, optional DB tests)

## CI/CD

Workflows in `.github/workflows/`:
- **ci.yml** — Main CI: lint, type-check, tests (with optional DB tests if `DATABASE_URL` secret is set)
- **architecture-guard.yml** — Strict architecture enforcement
- **pipeline.yml** — Enterprise CI pipeline with caching
- **pipeline.yaml** — Strict compliance pipeline

All workflows run on push to `main`, `dev/*`, `feature/*` branches and on PRs to `main`.

## Development

- **Lint:** `deno lint`
- **Type-check:** `deno check src/server.ts`
- **Test:** `deno test --allow-all`
- **Run server:** `deno run --allow-net --allow-read src/server.ts`

## Database (Optional)

If `DATABASE_URL` is set:
1. Run migrations: `./scripts/migrate.sh`
2. Tests with DB support will run in CI (requires `DATABASE_URL` secret in GitHub Actions)

## License

MIT
