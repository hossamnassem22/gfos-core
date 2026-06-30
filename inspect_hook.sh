#!/data/data/com.termux/files/usr/bin/bash

echo "===== .git/hooks ====="
ls -l .git/hooks

echo
echo "===== pre-commit ====="
if [ -f .git/hooks/pre-commit ]; then
    sed -n '1,200p' .git/hooks/pre-commit
else
    echo "No pre-commit hook"
fi

echo
echo "===== package.json scripts ====="
grep -n '"precommit"\|"prepare"\|"husky"\|"lint"\|"architecture"' package.json
