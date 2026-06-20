#!/bin/bash
# سكربت بسيط للتحقق من هيكلية الاستيرادات (Imports)
# يضمن أن موديول الـ Auth لا يستورد مباشرة من الـ Billing
grep -r "import.*Billing" src/modules/auth && echo "ARCH VIOLATION: Auth depends on Billing" && exit 1
echo "Architecture Integrity Verified."
