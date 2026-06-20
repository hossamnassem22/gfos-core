#!/bin/bash

echo "🔒 Checking architecture rules..."

echo ""
echo "🚨 Forbidden imports check:"
grep -rn "application/services" src && echo "❌ OLD SERVICE LAYER DETECTED"
grep -rn "infrastructure/auth/AuthService" src && echo "❌ DUPLICATE AUTH SERVICE"

echo ""
echo "📦 Auth entry points:"
grep -rn "AuthService" src || echo "OK"

echo ""
echo "📦 Token usage:"
grep -rn "TokenService" src

echo ""
echo "✅ Architecture scan complete"
