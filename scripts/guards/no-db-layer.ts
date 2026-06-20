#!/usr/bin/env bash

echo "🧱 Checking forbidden db layer..."

if grep -R "infrastructure/db" src >/dev/null 2>&1; then
  echo "🚨 FORBIDDEN: infrastructure/db still exists"
  grep -R "infrastructure/db" src
  exit 1
fi

echo "✅ No legacy db layer usage"
