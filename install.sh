#!/bin/bash
# تهيئة هيكل المشروع
mkdir -p src/application/services
mkdir -p src/domain/ledger
mkdir -p src/infrastructure/persistence
mkdir -p src/infrastructure/audit
mkdir -p src/infrastructure/workers
mkdir -p src/infrastructure/security
mkdir -p src/tests

echo "تم تهيئة بيئة GFOS-Core بنجاح."
echo "الآن يمكنك تشغيل: deno run --allow-all --unstable-kv src/test_full_cycle.ts"
