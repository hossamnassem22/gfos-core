#!/bin/bash
echo "🚀 Starting Enterprise Structural Initialization..."

# Define directories based on the architectural plan
DIRECTORIES=(
  "src/modules/auth/domain/ports"
  "src/modules/auth/application/services"
  "src/modules/auth/infrastructure/persistence"
  "src/modules/auth/infrastructure/security"
  "src/core/events"
  "src/modules/payments/application"
  "src/tests"
)

for dir in "${DIRECTORIES[@]}"; do
  mkdir -p "$dir"
  echo "✅ Created: $dir"
done

echo "✨ Structural Initialization Complete."
