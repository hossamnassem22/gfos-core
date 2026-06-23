# GFOS Core — خارطة الطريق و خطة دمج الفروع (Roadmap & Branch Merge Plan)

> آخر تحديث: 2026-06-23
> المؤلف: Mavis (root session)
> الحالة: خطة تنفيذية — جاهزة للتنفيذ اليدوي من قِبَل المالك

---

## ملخص تنفيذي

مستودع `gfos-core` كان فيه **فوضى بنيوية حقيقية**: 50 ملف مبعثر في الجذر
(kernel files, SQL scripts, shell scripts, ملفات قديمة)، 7 فروع متضارعة،
docs بدون فهرس. تم تنفيذ cleanup كامل للملفات (commit `f25e8ee`)، تحديث
الـ config والـ docs (commit `e443901`). الخطة هنا تكمّل البناء لتحويل
المستودع إلى كيان محاسبي/تجاري متكامل جاهز للسوق.

---

## الجزء 1: حالة الفروع الحالية

| الفرع | آخر commit | الحالة | الإجراء |
| :--- | :--- | :--- | :--- |
| `main` | `e443901` (الحالي) | نظيف بعد الـ refactor | يبقى main |
| `refactor/clean-architecture` | `8c947bd` (= main pre-refactor) | **مكرر، متقادم** | **احذف** |
| `feat/gfos-marketplace` | `2a0ecae` (ahead 4 commits) | فيه **marketplace API + merchant frontend + DB schema** | **ادمج** (الأهم) |
| `feature/new-module` | `5a461e3` (ahead 1 commit) | فيه **ledger module setup** + TLA+/Agda specs | **ادمج مع تنظيف** |
| `hossamnassem22-patch-1` | `dc4bbfb` | CI workflow for Deno | **ادمج أو احذف** |
| `dependabot/*` | bumped | تحديثات actions فقط | **سيتم إغلاقها تلقائيًا** |

---

## الجزء 2: خطة دمج `feat/gfos-marketplace` (الأولوية القصوى)

### لماذا هو الأهم؟

- فيه **schema كامل للـ marketplace** (merchants, products, orders, reviews)
- فيه **API endpoints** للـ marketplace (`src/interfaces/http/routes/marketplace.ts`)
- فيه **merchant dashboard frontend** (`frontend/merchant.html`)
- ده اللي يفتح المجال للسوق التجاري المذكور في طلبك

### خطة الدمج (3 مراحل)

#### المرحلة 2.1: استكشاف الـ diff

```bash
git fetch origin
git checkout -b chore/merge-marketplace origin/main
git merge --no-ff origin/feat/gfos-marketplace --no-commit
git status  # راجع الملفات
```

**المتوقع**: تعارضات في:
- `frontend/serve.ts` (كلاهم عدّله)
- `frontend/index.html` (تحسينات)
- ملفات الـ workflows تحت `.github/workflows/` (الفرع فيه legacy ضخم)
- `src/main.ts` (الفرع يصدّر entry مختلف)

#### المرحلة 2.2: استراتيجية حل التعارضات

| الملف | الاستراتيجية |
| :--- | :--- |
| `.github/workflows/_legacy/*.yml` | **احذف المجلد كله** — مش محتاجين CI legacy بعد ما الـ refactor اتعمل |
| `.github/workflows/agda.yml.disabled` | **احذف** (disabled أصلاً) |
| `frontend/serve.ts` | خُذ نسخة الـ marketplace (أغنى features) |
| `frontend/index.html` | قارن واختار الأغنى، أو ادمج يدويًا |
| `frontend/merchant.html` | **خذ الجديدة** (موجودة في الـ marketplace branch فقط) |
| `src/main.ts` | خذ نسخة الـ marketplace (تستخدم merchant dashboard) |
| `src/interfaces/` | **خذ الجديدة** (الـ marketplace عنده HTTP server) |
| `packages/algebra/` | **خذ الجديدة** (Causality/Ordering) |
| `tests/production.smoke.test.ts` | **خذ الجديدة** |

#### المرحلة 2.3: Commit الدمج

```bash
git add -A
git commit -m "merge: feat/gfos-marketplace (merchant dashboard + marketplace API + schema)

- Add src/interfaces/http/ (Fastify/Express server with marketplace routes)
- Add src/infrastructure/persistence/{Merchant,Order,Product}Repository.ts
- Add packages/algebra/ (causality/ordering primitives for kernel)
- Add frontend/merchant.html (professional merchant dashboard SPA)
- Add schema additions for marketplace tables (merchants, products, orders, reviews)
- Drop .github/workflows/_legacy/ (15 superseded CI workflows)
- Drop .github/workflows/agda.yml.disabled

Conflict resolution:
- frontend/serve.ts: took marketplace version (richer feature set)
- frontend/index.html: kept both screens (customer + merchant)
- src/main.ts: routed to marketplace CLI (report command)
"
git push origin chore/merge-marketplace
```

### الاختبار بعد الدمج

```bash
deno task check
deno task test
deno task arch:check
deno task uat
```

---

## الجزء 3: خطة دمج `feature/new-module`

### المحتوى

- `libs/ledger-kernel/{DoubleEntryEngine,RuleRegistry}.ts` (موجود فعلاً في main لكن هنا ممكن يكون فيه تحسينات)
- `migrations/001_update_ledger_schema.sql` (موجود فعلاً)
- ملفات TLA+ للنواة الرسمية: `CFPS_Core.tla`, `CFPS_Model.tla`, `Execution_Kernel.tla`, `Scheduler.tla`, `Deterministic_Scheduler.tla`, `Formal_Proof_Layer.tla`, `Formal_Certification_Layer.tla`
- `agda-files.txt` (manifest)
- `node_modules/` (!!! متسرّب للمستودع — لازم يتنظف)

### المشكلة الكبرى

- `node_modules/` مترفع في الـ branch ده! ده **كارثي** لازم يتشال فورًا
- ملفات TLA+ مش متكاملة مع بنية Deno/TS الحالية — نضعها في `docs/formal-specs/`

### خطة الدمج

```bash
# 1. اعمل branch نظيف
git checkout main
git checkout -b chore/merge-new-module

# 2. اعمل merge dry-run
git merge --no-commit --no-ff origin/feature/new-module

# 3. شيل node_modules فورًا
git rm -rf --cached node_modules/ 2>/dev/null
echo "node_modules/" >> .gitignore  # (موجود فعلاً، تأكد)

# 4. انقل TLA+ specs للـ docs
mkdir -p docs/formal-specs/tla
git mv CFPS_Core.tla CFPS_Model.tla Execution_Kernel.tla Scheduler.tla \
       Deterministic_Scheduler.tla Formal_Proof_Layer.tla \
       Formal_Certification_Layer.tla docs/formal-specs/tla/
git mv agda-files.txt docs/formal-specs/
git mv legacy-tests/ tests/legacy/  # أو احذف لو قديم

# 5. لو الـ libs/ledger-kernel/ فيه تحديث، ادمجه بحذر
diff -r libs/ledger-kernel <(git show origin/feature/new-module:libs/ledger-kernel) 2>&1 | head -20
# لو فيه اختلافات حقيقية، خذها. لو مكررة، اترك main.

# 6. حذف ملفات الجذر المكررة (الـ feature branch عنده kernel files في الجذر)
# دلوقتي عندنا في src/kernel/ بالفعل، فنرفض أي نسخة في الجذر
git checkout origin/feature/new-module -- src  # لا تعمل هذا!
# بدلًا منه:
# - لو فيه ملفات kernel جديدة في feature branch مش في main، خذها
# - لكن ضعها في src/kernel/ مش في الجذر
```

---

## الجزء 4: خطة حذف الفروع المكررة

```bash
# حذف الفرع المكرر
git push origin --delete refactor/clean-architecture

# (اختياري) حذف الـ patch-1 بعد دمجه في workflows
# git push origin --delete hossamnassem22-patch-1
```

---

## الجزء 5: خارطة طريق المنتج (Product Roadmap)

### ✅ المرحلة 0: تنظيف البنية (تم)

- [x] إعادة تنظيم 50 ملف في الجذر
- [x] توحيد README
- [x] إضافة docs/README.md فهرس
- [x] تحديث deno.json / package.json / tsconfig.json / import_map.json
- [x] توسيع .gitignore

### 🔄 المرحلة 1: دمج الفروع (الآن)

- [ ] دمج `feat/gfos-marketplace` (marketplace API + merchant dashboard)
- [ ] دمج/تنظيف `feature/new-module` (شيل node_modules، ضع TLA+ في docs)
- [ ] حذف `refactor/clean-architecture` (مكرر)
- [ ] تشغيل كل الاختبارات + `arch:check` بعد كل دمج

### 📋 المرحلة 2: إغلاق الفجوات في الـ DDD Layers

**مشكلة معروفة**: داخل `src/` فيه تكرار ومسارات غريبة:
- `src/application/index.js` (فاضي)
- `src/domain/index.js` (فاضي)
- `src/domain/ledger/{journal-entry.js, journal-entry.t, journal-entry.ts}` (3 نسخ)
- `src/infrastructure/{EventStore.ts, InMemoryEventStore.ts, MongoEventStore.ts}` (3 implementations)
- `src/infrastructure/{JwtService, AuthService}` مكررة بين security/ و services/
- `src/infrastructure/observability/auditLogger.ts` و `audit/AuditLogger.ts` (2 implementations)

**الإجراءات**:
```bash
# 1. شيل الملفات الفارغة
rm src/application/index.js src/domain/index.js

# 2. وحّد journal-entry (خلّي .ts فقط)
rm src/domain/ledger/journal-entry.js src/domain/ledger/journal-entry.t
rm src/domain/ledger/ledger-line.js  # if exists

# 3. شيل ملفات .save (emergency backups from editors)
find src -name "*.save" -delete
find src -name "*.bak" -delete
find src -name "*.tmp" -delete

# 4. وحّد AuditLogger
# قارن: src/infrastructure/observability/auditLogger.ts
#       src/infrastructure/audit/AuditLogger.ts
#       src/infrastructure/logger/AuditLogger.ts
# احتفظ بالأشمل، احذف الباقي

# 5. وحّد JwtService
# قارن: src/infrastructure/security/JwtService.ts
#       src/infrastructure/services/JwtService.ts
```

### 🚀 المرحلة 3: استكمال النواة المحاسبية للـ Production

من [PROJECT_STATUS.md](../PROJECT_STATUS.md) و [CHANGELOG.md](../CHANGELOG.md):

| الميزة | الحالة | الجهد |
| :--- | :--- | :--- |
| **Customer Workspace UI** | Phase 1 | متوسط |
| **Notifications System** (upcoming, overdue, escalation) | Phase 2 | متوسط |
| **Analytics** (top overdue, collection, cashflow) | Phase 3 | كبير |
| **Penalty Engine** (configurable rules) | Phase 4 | كبير |
| **Marketplace integration** (من الـ merge) | جديد | كبير |
| **Multi-currency support** (FX engine موجود، يحتاج ربط) | جديد | كبير |
| **Webhooks API** (للتكامل مع أنظمة خارجية) | جديد | متوسط |
| **Open Banking integration** | مستقبلي | كبير |
| **Mobile API (PWA)** | مستقبلي | متوسط |

### 🛡️ المرحلة 4: بنية تحتية و DevOps

- [ ] CI/CD pipeline موحّد (بعد حذف `_legacy` workflows)
- [ ] Container registry + versioning (`v0.5.0`, `v0.6.0`, ...)
- [ ] Migrations runner (بدل تشغيل SQL يدوي)
- [ ] Monitoring (Prometheus + Grafana — مذكور في `docs/kpis/`)
- [ ] Backup automated (cron بدل shell script يدوي)
- [ ] Disaster recovery runbook (مذكور في `docs/operations/IncidentResponse.md`)

### 🏪 المرحلة 5: السوق التجاري (Commercial Launch)

- [ ] Pricing tiers (FREE, PRO, ENTERPRISE) — Schema جاهز في marketplace
- [ ] Merchant onboarding flow
- [ ] KYC/AML integration
- [ ] Tax engine (VAT, income tax) — مرحلة متقدمة
- [ ] Multi-language support (عربي/إنجليزي/فرنسي)
- [ ] Payment gateway integrations (Fawry, PayMob, Stripe)
- [ ] Reporting & regulatory exports

---

## الجزء 6: توصيات تنفيذية فورية

### 1. أولًا: أنشئ PR من الـ refactor الحالي (commit `e443901`)

```bash
git push origin main
# افتح PR على GitHub
```

### 2. ثانيًا: افتح `chore/merge-marketplace` branch

اتبع خطة الجزء 2. أول PR بعد الـ refactor.

### 3. ثالثًا: اعمل Issue Tracking للـ cleanup داخل `src/`

كل مجموعة (AuditLogger, JwtService, EventStore) = issue منفصل، عشان الـ PRs تكون صغيرة ومراجعة.

### 4. رابعًا: شغّل `deno task arch:check` دوريًا

ده يضمن إن البنية المعمارية ما تتكسرش مع نمو الكود.

---

## الجزء 7: المخاطر و نقاط الانتباه

| المخاطرة | التأثير | التخفيف |
| :--- | :--- | :--- |
| `node_modules/` في `feature/new-module` | تضخم تاريخ git | شيله قبل الدمج، ضيف `.gitignore` strict |
| ملفات kernel بدون tests | regressions في المحاسبة | اكتب unit tests لكل ملف في `src/kernel/` |
| 3 implementations لـ EventStore | تشتيت | اختر implementation واحد (PostgreSQL للأمان) |
| Workflows CI قديمة ومكررة | بطء CI | بعد دمج marketplace، احذف `_legacy/` كله |
| مفيش deno مثبت في الـ CI الحالي؟ | لازم نتأكد | راجع `.github/workflows/*.yml` بعد التنظيف |

---

## الجزء 8: KPIs للمراقبة

من [docs/kpis/system-health.md](../kpis/system-health.md):

- **p99 latency** < 200ms لكل endpoint مالي
- **Idempotency violations** = 0
- **Ledger imbalance events** = 0 (تنبيه فوري لو > 0)
- **Failed writes** < 0.01%
- **Reconciliation drift** < 0.001 EGP
- **Time to deploy** < 10 min
- **MTTR** (Mean Time To Recovery) < 30 min

---

## الجزء 9: جهات الاتصال و المرجع

- **الكود**: `src/` (DDD) + `libs/` (shared libraries) + `kernel/` (formal core)
- **الوثائق**: `docs/README.md` (الفهرس)
- **الخطط**: `docs/ROADMAP_AND_BRANCH_MERGE_PLAN.md` (هذا الملف)
- **الحالة**: `PROJECT_STATUS.md` و `CHANGELOG.md`
- **CI**: `.github/workflows/` (بعد التنظيف)

---

**جاهز للدمج؟** ابدأ بـ `chore/merge-marketplace` — ده أكبر ربح فوري.
