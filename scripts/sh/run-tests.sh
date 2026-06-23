#!/bin/bash
# بروتوكول الاختبار العلمي (Scientific Test Protocol)
# 1. تنظيف الكاش لضمان بدء تجربة جديدة (Baseline Establishment)
deno clean

# 2. تنفيذ الاختبارات مع تفعيل الفحص الصارم للأنواع (Type Checking)
# مع ضمان توفر صلاحيات الوصول والبيئة (Environmental Control)
deno test --allow-env --allow-net --allow-read --check --fail-fast
