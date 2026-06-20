#!/bin/bash
cd /data/data/com.termux/files/home/gfos-core
export $(cat .env | xargs)
pg_ctl -D $PREFIX/var/lib/postgresql start 2>/dev/null
sleep 2
deno run --allow-net --allow-env --allow-read --allow-sys src/main.ts
