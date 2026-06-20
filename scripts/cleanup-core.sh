#!/bin/bash

echo "🧹 Cleaning duplicate layers..."

rm -f src/application/services/AuthService.ts
rm -f src/infrastructure/auth/AuthService.ts
rm -f src/_quarantine -rf 2>/dev/null

echo "✅ Cleanup done"
