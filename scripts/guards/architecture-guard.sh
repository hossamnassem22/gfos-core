#!/usr/bin/env bash

echo "🧱 Running Architecture Policy Guard..."

POLICY="architecture.policy.json"

FAIL=0

check() {
  echo "🔍 Checking: $1"
  if grep -R "$1" src >/dev/null 2>&1; then
    echo "❌ Violation detected: $1"
    grep -R "$1" src
    FAIL=1
  fi
}

# Legacy database paths
check "../../database"
check "../database"

# Infra alias
check "@infra/database"

if [ "$FAIL" -ne 0 ]; then
  echo "🚨 ARCHITECTURE VIOLATION DETECTED"
  exit 1
fi

echo "✅ Architecture policy respected"
