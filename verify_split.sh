#!/data/data/com.termux/files/usr/bin/bash

echo "========== Verification =========="

echo
echo "Checking CSS..."
grep -n "<style>" src/interfaces/http/server.ts || echo "OK: no inline CSS"

echo
echo "Checking JS..."
grep -n "<script>" src/interfaces/http/server.ts || echo "OK: no inline JS"

echo
echo "Checking external CSS..."
grep -n "dashboard.css" src/interfaces/http/server.ts

echo
echo "Checking external JS..."
grep -n "dashboard.js" src/interfaces/http/server.ts

echo
echo "Generated files:"
ls -lh \
src/interfaces/http/static/css/dashboard.css \
src/interfaces/http/static/js/dashboard.js

echo
echo "Done."
