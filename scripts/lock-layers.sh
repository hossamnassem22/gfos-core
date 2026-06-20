#!/bin/bash

echo "🔒 Locking architecture layers..."

# منع التكرارات الخطيرة
find src -name "*AuthService*.ts" -type f | grep -v "application/auth" && echo "WARNING: duplicate AuthService found"

# عرض مصادر Auth فقط
echo "📦 Auth entry points:"
grep -rn "AuthService" src

echo "📦 Token usage:"
grep -rn "TokenService" src

echo "✅ Layer audit complete"
