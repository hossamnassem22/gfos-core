#!/bin/bash

while true; do
  echo "🚀 Starting GFOS Core..."

  deno run \
    --no-check \
    --allow-net \
    --allow-env \
    --allow-read \
    --allow-sys \
    --env-file=.env \
    src/main.ts

  echo "⚠️ Server crashed. Restarting in 2s..."
  sleep 2
done
