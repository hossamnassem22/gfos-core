#!/usr/bin/env bash

echo "🧱 Architecture Guard Layer Running..."

ERRORS=0

# =========================
# 1. Forbidden legacy database paths
# =========================
if grep -R "\.\./\.\./database" src; then
  echo "❌ VIOLATION: legacy database path detected"
  ERRORS=1
fi

if grep -R "../../database/connection.ts" src; then
  echo "❌ VIOLATION: direct database relative import detected"
  ERRORS=1
fi

# =========================
# 2. Forbidden alias layer
# =========================
if grep -R "@infra/database" src; then
  echo "❌ VIOLATION: infra alias still used"
  ERRORS=1
fi

# =========================
# 3. Layer separation rules
# =========================

# domain must NOT import infrastructure
if grep -R "from .*infrastructure" src/domain; then
  echo "❌ VIOLATION: domain importing infrastructure"
  ERRORS=1
fi

# application must NOT import HTTP layer
if grep -R "from .*interfaces" src/application; then
  echo "❌ VIOLATION: application importing interfaces"
  ERRORS=1
fi

# =========================
# RESULT
# =========================

if [ "$ERRORS" -ne 0 ]; then
  echo "🚨 Architecture Guard FAILED"
  exit 1
fi

echo "✅ Architecture Guard PASSED"
