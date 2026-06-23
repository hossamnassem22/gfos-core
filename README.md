# GFOS Core — Global Financial Operations Platform 🏦

نظام إدارة الديون والائتمان والمحاسبة المالية متعدد المستأجرين للسوق التجاري.
Production-grade financial operating system for debt management, payments,
installments, double-entry ledger accounting, audit trails, and multi-tenant
financial operations.

---

## ما هو GFOS Core؟

GFOS Core هو **نواة مالية بنكية** تقدم:

- **إدارة الديون** (FLAT_RATE, DECLINING_BALANCE, BALLOON)
- **جدولة الأقساط** (Amortization Engine)
- **معالجة المدفوعات** (Payment Waterfall — توزيع waterfall)
- **المحاسبة مزدوجة القيد** (Double-Entry Ledger)
- **سجلات تدقيق غير قابلة للتغيير** (Immutable Audit Logs)
- **عزل متعدد المستأجرين** (Multi-Tenant Isolation)
- **معالجة المتأخرات** (Overdue Engine)
- **لوحة تحكم** (Dashboard)
- **طبقة Marketplace** (منتجات، تجار، طلبات، تقييمات) — من فرع `feat/gfos-marketplace`
- **نواة رسمية** (Formal Kernel) — إسناد الأحداث، التحقق من السببية

---

## المتطلبات

- **Deno** >= 1.40
- **PostgreSQL** >= 15
- (اختياري) Termux على Android للتطوير المحلي
- (اختياري) Docker & Docker Compose للنشر

---

## التشغيل السريع

```bash
# 1. الإعداد
cp .env.example .env  # ثم عدّل القيم
bash scripts/sh/install.sh    # تجهيز بنية المشروع

# 2. قاعدة البيانات
bash scripts/sh/start.sh      # يشغّل PostgreSQL + API
# أو يدويًا:
psql -d gfos -f db/schema.sql
psql -d gfos -f src/infrastructure/database/schema-auth.sql

# 3. الـ API
deno task dev                  # development mode
# أو
deno task start                # production mode
```

إيقاف كل شيء:
```bash
bash scripts/sh/stop.sh
```

---

## هيكل المستودع

```
gfos-core/
├── src/                        # الكود المصدري
│   ├── kernel/                 # النواة الرسمية (genesis, snapshot, validation)
│   ├── core/                   # DDD core (Money, Journal, Amortization, Waterfall)
│   ├── domain/                 # Domain layer (Debt, Ledger, Auth, User)
│   ├── application/            # Use-cases & engines (commands, services, engines)
│   ├── infrastructure/         # Persistence, external services, observability
│   ├── interfaces/             # HTTP controllers, routes, schemas
│   └── main.ts                 # Application entry point
│
├── libs/                       # مكتبات مشتركة قابلة لإعادة الاستخدام
│   ├── accounting-core/        # محرك محاسبي مستقل
│   ├── ledger-kernel/          # Double-Entry engine
│   ├── proof-engine/           # محرك إثبات رسمي
│   ├── snapshot-engine/        # Snapshot & replay
│   └── audit-layer/            # Audit transformer
│
├── services/                   # خدمات صغيرة (regulatory-api, إلخ)
├── shared/                     # عقود مشتركة (contracts)
│
├── migrations/                 # ترحيلات قاعدة البيانات
├── db/
│   └── schema.sql              # الـ master schema
├── backups/                    # نسخ احتياطية من PG dumps
│
├── scripts/
│   ├── sh/                     # Shell scripts (start, stop, install, backup, debug)
│   ├── ts/                     # TypeScript scripts (UAT, simulation, test entry)
│   └── sql/                    # SQL one-off scripts (fix_view, debug, setup)
│
├── docs/                       # الوثائق الكاملة (27 ملف)
│   ├── README.md               # فهرس الوثائق
│   ├── ARCHITECTURE.md         # البنية المعمارية التفصيلية
│   ├── ARCHITECTURE_CONSTITUTION.md  # الثوابت المعمارية
│   ├── DOMAIN_BOUNDARIES.md    # حدود النطاق (Bounded Contexts)
│   ├── LEDGER_RULES.md         # قواعد القيد المزدوج
│   ├── POSTING_RULES.md        # قواعد الترحيل
│   ├── GL_MAPPING_RULES.md     # ربط الأحداث بحسابات الأستاذ
│   ├── FINANCIAL_RULES_REGISTRY.md  # سجل القواعد المالية
│   ├── ACCOUNTING_*/           # قوالب وفهارس المحاسبة
│   ├── EVENT_CATALOG.md        # فهرس أحداث النطاق
│   ├── ERROR_CATALOG.md        # فهرس الأخطاء
│   ├── ADRs/                   # Architecture Decision Records
│   ├── api/spec/openapi.yaml   # OpenAPI 3 specification
│   ├── operations/             # Incident response
│   ├── handbook/               # Day-2 maintenance
│   ├── scaling/                # Auto-scaling policy
│   ├── kpis/                   # System health metrics
│   ├── compliance/             # Validation reports
│   ├── scientific/             # Methodology
│   └── final/                  # Launch readiness
│
├── tests/                      # الاختبارات
│   ├── production.smoke.test.ts
│   ├── smoke.test.ts
│   └── jest.config.js          # (legacy)
│
├── tools/                      # أدوات مساعدة
├── legacy/                     # ملفات kernel قديمة (محفوظة للمرجع)
│
├── deploy/                     # PM2 ecosystem config
├── docker/                     # Dockerfile (root هو الـ canonical)
├── k8s/                        # Kubernetes manifests
├── infra/                      # Docker infrastructure assets
│
├── public/                     # Static assets (sample catalog, إلخ)
├── cli/                        # CLI entry points (overdue scheduler)
│
├── logs/                       # Runtime logs
├── archive/                    # ملفات مؤرشفة (.bak, ملفات قديمة)
│
├── docker-compose.yml          # Root orchestration
├── Dockerfile                  # Production image
│
├── .env.example
├── .gitignore
├── .gitattributes
├── deno.json                   # Deno tasks & config
├── package.json                # Node-style scripts
├── tsconfig.json               # TypeScript config
├── import_map.json             # Path aliases
│
├── PROJECT_STATUS.md           # حالة المشروع والـ milestones
├── CHANGELOG.md                # سجل التغييرات
├── CONTRIBUTING.md             # إرشادات المساهمة
├── ARCHITECTURE.md             # ملخص بنية من صفحة واحدة
├── GFOS_Kernel_Engineering_Manifest.md  # خصائص النواة الرسمية
└── LICENSE
```

---

## الـ Tasks المتاحة

كل المهام معرفة في `deno.json` و `package.json`:

| المهمة | الوصف |
| :--- | :--- |
| `deno task dev` | تشغيل في وضع التطوير مع hot reload |
| `deno task start` | تشغيل production |
| `deno task test` | تشغيل كل الاختبارات |
| `deno task test:kernel` | اختبارات النواة فقط |
| `deno task test:domain` | اختبارات الـ domain |
| `deno task test:app` | اختبارات الـ application |
| `deno task test:infra` | اختبارات الـ infrastructure |
| `deno task lint` | فحص الكود |
| `deno task fmt` | تنسيق الكود |
| `deno task fmt:check` | التحقق من التنسيق |
| `deno task check` | Type-check للـ entry point |
| `deno task typecheck` | Type-check لكل المشروع |
| `deno task arch:check` | فحص قواعد البنية المعمارية |
| `deno task uat` | دورة UAT كاملة |
| `deno task build` | عمل bundle للـ production |

---

## الوحدات الأساسية (Core Modules)

| الوحدة | المسار | الوصف |
| :--- | :--- | :--- |
| **Authentication & Authorization** | `src/application/auth/`, `src/infrastructure/security/` | JWT، RBAC، Refresh tokens |
| **Customer Management** | `src/domain/customer/`, `src/application/services/Customer*` | إدارة العملاء مع tenant isolation |
| **Debt Management** | `src/domain/debt/`, `src/application/engines/` | اتفاقيات الديون (FLAT, DECLINING, BALLOON) |
| **Installment Scheduling** | `src/core/Amortization.ts` | توليد جدول الأقساط |
| **Payment Processing** | `src/core/PaymentWaterfall.ts`, `src/application/services/Payment*` | توزيع waterfall، atomic processing |
| **Financial Ledger** | `src/core/Journal.ts`, `src/domain/ledger/` | Double-entry accounting |
| **Audit Logs** | `src/infrastructure/audit/`, `src/infrastructure/observability/` | Immutable، JSONB payloads |
| **Transaction History** | `src/application/services/`, `src/application/reports/` | كشف الحساب، التقارير |
| **Reporting** | `src/application/reports/`, `src/application/services/dashboard*` | Dashboard APIs |
| **Scheduler** | `src/infrastructure/scheduler/`, `cli/run-overdue.ts` | معالجة المتأخرات يوميًا 00:05 |
| **Marketplace** | (in `feat/gfos-marketplace`) | تجار، منتجات، طلبات، تقييمات |

---

## الضمانات المالية (Financial Guarantees)

✅ **Double-entry accounting** — كل قيد متوازن، لا استثناء  
✅ **Immutable audit logs** — السجلات لا تُعدّل أبدًا  
✅ **ACID-compliant operations** — كل العمليات ذرية  
✅ **Atomic payment processing** — لا مدفوعات جزئية  
✅ **Balance reconciliation** — مطابقة يومية  
✅ **Full transaction traceability** — كل عملية لها معرف فريد  
✅ **Soft delete support** — لا حذف فعلي، فقط flagging  
✅ **Multi-tenant isolation** — عزل كامل بين المستأجرين  

---

## كيف تُساهم

1. اقرأ [CONTRIBUTING.md](./CONTRIBUTING.md) و [ARCHITECTURE_CONSTITUTION.md](./docs/ARCHITECTURE_CONSTITUTION.md)
2. اقرأ [DOMAIN_BOUNDARIES.md](./docs/DOMAIN_BOUNDARIES.md) عشان تفهم الـ Bounded Contexts
3. شغّل `deno task check` و `deno task arch:check` قبل أي commit
4. استخدم Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
5. كل تغيير في قاعدة البيانات = migration جديدة في `migrations/`
6. كل تغيير في Financial Rules = تحديث [FINANCIAL_RULES_REGISTRY.md](./docs/FINANCIAL_RULES_REGISTRY.md)

---

## الترخيص

Proprietary — جميع الحقوق محفوظة.

---

## حالة المشروع

شوف [PROJECT_STATUS.md](./PROJECT_STATUS.md) و [CHANGELOG.md](./CHANGELOG.md) لمتابعة التقدم.
