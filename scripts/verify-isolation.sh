#!/bin/bash
# منع الاستيراد المباشر بين الموديولات (Strict Modularization)
if grep -r "from \"../modules/" src/modules; then
  echo "❌ VIOLATION: Cross-module direct import detected."
  exit 1
fi
