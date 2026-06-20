#!/bin/bash

if grep -r "class AuthService" src | grep -v "application/auth/usecases"; then
  echo "❌ DUPLICATE AuthService DETECTED"
  exit 1
fi

echo "✅ No duplicates detected"
