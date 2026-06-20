#!/bin/bash

echo "🔒 GFOS Architecture Lock Check..."

# منع استخدام legacy token service فقط
if grep -R "infrastructure/security/TokenService" src/interfaces src/application; then
  echo "❌ LEGACY TOKEN SERVICE STILL USED"
  exit 1
fi

# منع application من الوصول المباشر للـ DB
if grep -R "infrastructure/database" src/application; then
  echo "❌ APPLICATION LAYER VIOLATION"
  exit 1
fi

echo "✅ Architecture Locked Clean"
