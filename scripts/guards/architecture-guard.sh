#!/usr/bin/env bash

echo "🧱 Running Architecture Policy Guard..."

FAILED=0

echo "🔍 Checking forbidden db layer usage..."

if grep -R "infrastructure/db" src >/dev/null 2>&1; then
  echo "🚨 FORBIDDEN: infrastructure/db detected"
  grep -R "infrastructure/db" src
  FAILED=1
fi

echo "🔍 Checking old database paths..."

if grep -R "\.\./\.\./database" src >/dev/null 2>&1; then
  echo "🚨 FORBIDDEN: old database relative paths"
  grep -R "\.\./\.\./database" src
  FAILED=1
fi

echo "🔍 Checking legacy alias usage..."

if grep -R "@infra/database" src >/dev/null 2>&1; then
  echo "🚨 FORBIDDEN: alias imports"
  grep -R "@infra/database" src
  FAILED=1
fi

echo "🔍 Checking direct db connection misuse..."

if grep -R "db/connection" src >/dev/null 2>&1; then
  echo "🚨 FORBIDDEN: legacy db connection usage"
  grep -R "db/connection" src
  FAILED=1
fi

if [ $FAILED -eq 1 ]; then
  echo "❌ ARCHITECTURE FAILED"
  exit 1
fi

echo "✅ Architecture OK"
