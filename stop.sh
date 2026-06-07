#!/data/data/com.termux/files/usr/bin/bash

echo "▶ Stopping Selfni Core..."
pkill -f "src/interfaces/http/server.ts" 2>/dev/null && echo "✓ API Server stopped" || echo "  API Server not running"

echo "▶ Stopping PostgreSQL..."
pg_ctl -D $PREFIX/var/lib/postgresql stop -m fast > /dev/null 2>&1 && echo "✓ PostgreSQL stopped" || echo "  PostgreSQL not running"

echo "Done."
