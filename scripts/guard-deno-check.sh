#!/usr/bin/env bash

echo "🧪 Running Deno type check..."

deno check src/main.ts

if [ $? -ne 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi

echo "✅ Type check passed"
