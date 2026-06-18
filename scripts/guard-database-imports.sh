#!/usr/bin/env bash

echo "🔍 Checking forbidden database imports..."

BAD=$(grep -R "\.\./\.\./database" src || true)

if [ ! -z "$BAD" ]; then
  echo "❌ FORBIDDEN database imports detected:"
  echo "$BAD"
  exit 1
fi

BAD2=$(grep -R "@infra/database" src || true)

if [ ! -z "$BAD2" ]; then
  echo "❌ FORBIDDEN alias imports detected:"
  echo "$BAD2"
  exit 1
fi

echo "✅ Database import rules OK"
