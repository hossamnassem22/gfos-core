git fetch origin

git ls-tree -r origin/main --name-only | grep deno.yml || echo "OK: deno.yml not found on origin/main"
