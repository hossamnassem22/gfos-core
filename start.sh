#!/data/data/com.termux/files/usr/bin/bash
echo "Starting PostgreSQL..."
pg_ctl -D $PREFIX/var/lib/postgresql status > /dev/null 2>&1
if [ $? -ne 0 ]; then
  pg_ctl -D $PREFIX/var/lib/postgresql start
  sleep 2
fi
echo "Starting API..."
JWT_SECRET=selfni-dev-secret-change-in-prod deno run --allow-all src/interfaces/http/server.ts &
sleep 3
curl -s http://localhost:3011/health && echo " ✅ Ready"
