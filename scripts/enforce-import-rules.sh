#!/bin/bash

echo "🔒 Enforcing GFOS dependency rules..."

# ممنوع application -> infrastructure
if grep -R "from \"\.\.\/\.\.\/infrastructure" src/application; then
  echo "❌ VIOLATION: application layer importing infrastructure"
  exit 1
fi

# ممنوع interfaces -> application services مباشرة
if grep -R "from \"\.\.\/\.\.\/application\/services" src/interfaces; then
  echo "❌ VIOLATION: interfaces importing application services directly"
  exit 1
fi

# منع legacy usage
if grep -R "_legacy_disabled" src; then
  echo "❌ LEGACY LEAK DETECTED"
  exit 1
fi

echo "✅ Architecture rules clean"
