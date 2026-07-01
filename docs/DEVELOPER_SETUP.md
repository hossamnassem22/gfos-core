# Developer setup for GFOS-Core

This document explains how to get a local development environment running for GFOS-Core.

Prerequisites
- Deno >= 1.40
- PostgreSQL >= 15 (or a running Postgres instance)
- bash, psql (Postgres client)

Quickstart (dev)
1. Clone the repo
   git clone https://github.com/hossamnassem22/gfos-core.git
   cd gfos-core

2. Copy environment file and edit
   cp .env.example .env
   # Edit .env and set DATABASE_URL, JWT_SECRET etc.

3. Create the database and apply schema
   export DATABASE_URL="postgres://gfos:change_me@127.0.0.1:5432/gfos"
   createdb $(echo "$DATABASE_URL" | sed -E 's/.*\/([^?]+)(\?.*)?$/\1/') || true
   ./scripts/migrate.sh

4. Run the server
   deno run --allow-net --allow-read --allow-env src/server.ts

5. Run unit tests
   deno test --allow-all

Notes
- The server exports a request handler so tests can import it without needing a network port.
- CI runs lint and tests on every push to main (see .github/workflows/ci.yml).

