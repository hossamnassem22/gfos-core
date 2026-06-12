#!/usr/bin/env bash

echo "=== GFOS DISCOVERY ENGINE ==="
echo

echo "=== ROOT STRUCTURE ==="
find . -maxdepth 4 -type d | sort

echo

echo "=== CORE ENTITIES ==="
grep -R "CanonicalEvent" . --line-number 2>/dev/null

echo

echo "=== ORDERING / CAUSALITY ==="
grep -R "OrderingRules" . --line-number 2>/dev/null

echo

echo "=== PROPERTY TESTS ==="
find genesis -type f -name "*.ts" 2>/dev/null

echo

echo "=== FAST-CHECK USAGE ==="
grep -R "fast-check" . --line-number 2>/dev/null

echo

echo "=== TYPESCRIPT FILES SAMPLE ==="
find . -type f -name "*.ts" | head -n 50
