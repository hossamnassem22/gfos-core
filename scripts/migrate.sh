#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Export DATABASE_URL or set it in .env"
  exit 1
fi

echo "Applying schema.sql to database..."

# Attempt to run psql; if not available, show helpful message.
if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -f schema.sql
  echo "Schema applied."
else
  echo "psql not found. Please install the PostgreSQL client or run migrations via another method."
  exit 1
fi
