#!/bin/bash

set -e

echo "🏦 Initializing GFOS Banking Core v2 Architecture..."

# Core layer
mkdir -p src/core

# Application layer
mkdir -p src/application/auth
mkdir -p src/application/auth/usecases

# Infrastructure layer
mkdir -p src/infrastructure/db
mkdir -p src/infrastructure/repositories
mkdir -p src/infrastructure/security
mkdir -p src/infrastructure/session

# Interface layer
mkdir -p src/interfaces/http/routes
mkdir -p src/interfaces/http/controllers
mkdir -p src/interfaces/http/middlewares

# Domain layer (future expansion)
mkdir -p src/domain

# Tests
mkdir -p src/test
mkdir -p tests

# Scripts
mkdir -p scripts

echo "✅ Architecture folders created successfully"
