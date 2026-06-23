#!/data/data/com.termux/files/usr/bin/bash

echo "╔════════════════════════════════════╗"
echo "║       Selfni Core — Startup        ║"
echo "╚════════════════════════════════════╝"

# 1. تشغيل PostgreSQL
echo "▶ Starting PostgreSQL..."
pg_ctl -D $PREFIX/var/lib/postgresql status > /dev/null 2>&1
if [ $? -ne 0 ]; then
  pg_ctl -D $PREFIX/var/lib/postgresql -l $HOME/gfos-core/logs/postgres.log start
  sleep 2
  echo "✓ PostgreSQL started"
else
  echo "✓ PostgreSQL already running"
fi

# 2. التحقق من قاعدة البيانات
echo "▶ Checking database..."
psql -d selfni_core -c "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "  Creating database..."
  createdb selfni_core
  psql -d selfni_core -f $HOME/gfos-core/src/infrastructure/database/schema.sql > /dev/null
  psql -d selfni_core -f $HOME/gfos-core/src/infrastructure/database/schema-auth.sql > /dev/null
  echo "✓ Database created and migrated"
else
  echo "✓ Database OK"
fi

# 3. تشغيل الـ API Server
echo "▶ Starting Selfni Core API..."
cd $HOME/gfos-core
deno run --allow-all src/interfaces/http/server.ts &

