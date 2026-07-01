#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Export DATABASE_URL or set it in .env"
  exit 1
fi

echo "Applying schema.sql to database if present..."
if [ -f schema.sql ]; then
  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -f schema.sql
  else
    echo "psql not found. Please install the PostgreSQL client or run migrations via another method."
    exit 1
  fi
fi

# Apply migrations in scripts/migrations
if [ -d scripts/migrations ]; then
  for f in scripts/migrations/*.sql; do
    echo "Applying $f"
    psql "$DATABASE_URL" -f "$f"
  done
fi

# Seed dev data if seed.sql exists
if [ -f scripts/seed.sql ]; then
  echo "Applying seed data"
  psql "$DATABASE_URL" -f scripts/seed.sql
fi

echo "Migrations complete."
