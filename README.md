# 🏪 GFOS Platform — Multi-Tenant Marketplace + Banking

> **نظام متكامل يربط المصنع → تاجر الجملة → التاجر → المحل → المستهلك**
> Built with **Deno + TypeScript + PostgreSQL** — production-grade financial operating system + e-commerce marketplace.

[![Deno](https://img.shields.io/badge/Deno-1.40+-000?logo=deno)](https://deno.land)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ الميزات (Features)

### 🛒 Marketplace (التجارة الإلكترونية)
- ✅ **Multi-tenant merchants** — كل تاجر له `tenant_id` خاص
- ✅ **Product catalog** — مع بحث عربي، فلترة، ترتيب متعدد
- ✅ **Order workflow** — PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- ✅ **Auto stock management** — خصم تلقائي عند التأكيد
- ✅ **Reviews + Trust score** — تقييم تلقائي + سمعة
- ✅ **Categories** — هرمية مع أيقونات
- ✅ **Cart + checkout** — مع تتبع حالة المخزون

### 🏦 Banking (النظام المالي)
- ✅ **Debt agreements** — FLAT, DECLINING, BALLOON amortizations
- ✅ **Amortization schedule** — جدول أقساط تلقائي
- ✅ **Payment waterfall** — توزيع تلقائي (فوائد → أصل → غرامات)
- ✅ **Overdue engine** — كشف تلقائي + Scheduler يومي
- ✅ **Double-entry ledger** — قيود محاسبية صحيحة
- ✅ **Financial events** — Event sourcing + idempotency
- ✅ **Money in millimes** — بدون floating point errors

### 📊 Analytics (التحليلات)
- ✅ **Portfolio health** — KPIs لكل tenant
- ✅ **Cashflow forecast** — توقع التدفقات النقدية
- ✅ **Merchant dashboard** — أداء التاجر (مبيعات، مخزون، تقييمات)
- ✅ **Customer portfolio** — محفظة العميل
- ✅ **Overdue reports** — تقارير التأخر

### 🔒 Security (الأمان)
- ✅ **JWT authentication** — مع roles (MERCHANT, CUSTOMER, ADMIN)
- ✅ **Multi-tenant isolation** — `tenant_id` على كل جدول
- ✅ **Ownership checks** — التاجر يعدل منتجاته فقط
- ✅ **SQL injection protection** — parameterized queries
- ✅ **CORS configured**

---

## 🚀 التثبيت السريع (Quick Start)

### المتطلبات (Requirements)
- [Deno](https://deno.land) >= 1.40
- [PostgreSQL](https://postgresql.org) >= 15
- Linux / macOS / WSL / Termux (Android)

### 1. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
createdb gfos_db

# تشغيل الـ migrations
psql -d gfos_db -f migrations/001_gfos_full_schema.sql
```

### 2. إعداد Environment Variables

```bash
cp .env.example .env
# عدّل DATABASE_URL و JWT_SECRET في .env
```

### 3. تشغيل المشروع

```bash
# Development mode (auto-reload)
deno task dev

# Production mode
deno task start

# Access points:
# - Banking Dashboard: http://localhost:3011/
# - Merchant Dashboard: http://localhost:3011/merchant
# - Health check:      http://localhost:3011/health
```

### 4. (اختياري) Docker

```bash
docker-compose up -d
```

---

## 📡 API Reference

### 🔐 Authentication

#### Register Merchant
```http
POST /api/merchants/register
Content-Type: application/json

{
  "name": "متجر النور",
  "phone": "01012345678",
  "password": "secret123",
  "businessType": "retailer",     // manufacturer | wholesaler | retailer | shop
  "category": "electronics",
  "city": "مدينة نصر",
  "governorate": "القاهرة"
}
```

#### Login Merchant
```http
POST /api/merchants/login
Content-Type: application/json

{ "phone": "01012345678", "password": "secret123" }

→ { "token": "m.xxx.signature", "merchant": { "id": "...", "name": "...", "plan": "FREE" } }
```

### 📦 Products

#### List Products (Public Catalog)
```http
GET /api/products?q=هاتف&category_id=<uuid>&min_price=100&max_price=5000&sort=newest&limit=20&offset=0
```

**Sort options:** `newest` | `price_asc` | `price_desc` | `popular` | `rating`

#### Get Product Details
```http
GET /api/products/<product_id>
→ includes merchant info + recent reviews
```

#### Create Product (Merchant Only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "iPhone 15 Pro",
  "titleAr": "آيفون ١٥ برو",
  "categoryId": "<uuid>",
  "price": 45000,
  "stock": 25,
  "lowStockThreshold": 5,
  "imageUrl": "https://...",
  "descriptionAr": "أحدث إصدارات آبل",
  "isFeatured": true
}
```

### 🛒 Orders

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "merchantId": "<uuid>",
  "customerName": "محمد",
  "customerPhone": "01098765432",
  "customerAddress": "شارع 9، المعادي",
  "items": [
    { "productId": "<uuid>", "quantity": 2 }
  ],
  "paymentMethod": "CASH_ON_DELIVERY"
}
```

#### Update Order Status (Merchant Only)
```http
PUT /api/orders/<order_id>/status
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "CONFIRMED" }   // CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED
```

### 📊 Dashboard

#### Merchant Dashboard
```http
GET /api/merchants/me/dashboard
Authorization: Bearer <token>

→ {
    kpis: { active_products, pending_orders, total_revenue, ... },
    topProducts: [...],
    lowStock: [...],
    recentOrders: [...],
    salesByDay: [{ day, orders, revenue }],
    unreadNotifications: 3
  }
```

### 🏦 Banking (Selfni Core)

#### Customer Portfolio
```http
GET /customers/portfolio
Authorization: Bearer <token>
```

#### Create Debt Agreement
```http
POST /debts
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "<uuid>",
  "principalCents": 50000000,   // 500,000 EGP in millimes
  "annualRateBps": 1200,         // 12% (basis points)
  "termMonths": 12,
  "amortType": "DECLINING",      // FLAT | DECLINING | BALLOON
  "currency": "EGP"
}
```

#### Record Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "debtId": "<uuid>",
  "paymentCents": 5000000,   // 50,000 EGP
  "currency": "EGP"
}
```

#### Analytics Summary
```http
GET /analytics/summary
Authorization: Bearer <token>

→ {
    portfolioHealth: { total_debts, overdue_installments, ... },
    cashflowForecast: [{ due_date, expected_cents }, ...]
  }
```

---

## 🗂️ Project Structure

```
gfos-core/
├── migrations/
│   └── 001_gfos_full_schema.sql     # Complete database schema
├── frontend/
│   ├── index.html                   # Banking dashboard
│   └── merchant.html                # Merchant dashboard (NEW)
├── src/
│   ├── interfaces/
│   │   └── http/
│   │       ├── server.ts            # Main HTTP server (Fastify-style)
│   │       └── routes/
│   │           └── marketplace.ts   # Marketplace endpoints (NEW)
│   ├── application/
│   │   ├── auth/                    # Authentication logic
│   │   ├── routes/                  # Banking route handlers
│   │   ├── engines/                 # OverdueEngine, PaymentEngine, etc.
│   │   └── services/                # Business logic
│   ├── core/
│   │   ├── financial-engine/        # Money handling, ledger
│   │   ├── ledger/                  # Double-entry accounting
│   │   ├── persistence/             # Storage engines
│   │   ├── resilience/              # Circuit breakers, retries
│   │   └── telemetry/               # Metrics, tracing
│   ├── domain/
│   │   ├── debt/                    # Debt aggregates + entities
│   │   ├── ledger/                  # Journal entries
│   │   └── user/                    # User domain
│   └── infrastructure/
│       ├── database/
│       │   └── connection.ts        # Postgres connection
│       ├── persistence/             # Repositories (Merchant, Product, etc.)
│       └── scheduler/               # Overdue scheduler
├── deno.json                        # Deno config + tasks
└── README.md                        # This file
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `merchants` | Multi-tenant merchant registry with location, trust score |
| `customers` | Consumer registry (customers + citizens) |
| `categories` | Hierarchical product categories |
| `products` | Product catalog with stock, pricing, ratings |
| `orders` | Order lifecycle with payment tracking |
| `order_items` | Line items with product snapshot |
| `reviews` | 1-5 ratings with merchant replies |
| `conversations` + `messages` | Merchant-customer chat |
| `notifications` | Typed notifications (NEW_ORDER, etc.) |
| `cart_items` | Persistent shopping cart |
| `trust_events` | Trust score change history |
| `audit_logs` | Full actor + change history |

### Banking Tables

| Table | Purpose |
|---|---|
| `debt_agreements` | Debt contracts with amortization type |
| `amortization_schedule` | Installment schedule |
| `payments` | Payment records with waterfall allocation |
| `financial_events` | Event sourcing with idempotency |
| `journal_entries` | Double-entry ledger |
| `ledger_entries` | Business ledger (sales, commissions) |

### Views

- `view_portfolio_health` — KPIs per tenant
- `view_overdue_report` — Overdue installments with days_late
- `view_merchant_dashboard` — Merchant performance

---

## 🧪 Testing

```bash
deno task test           # Run all tests
deno task lint           # Lint check
deno task fmt            # Format code
```

---

## 🔐 Security Considerations

1. **Change `JWT_SECRET` in production** — use a 32+ char random string
2. **Use HTTPS in production** — reverse proxy (nginx/Caddy)
3. **Database backups** — automated daily, test restore
4. **Rate limiting** — add at API gateway level
5. **Input validation** — extend Zod schemas for all endpoints
6. **Audit logging** — all mutations logged in `audit_logs`

---

## 🚧 Roadmap

- [x] Banking core (debts, payments, overdue)
- [x] Merchant authentication + profile
- [x] Product CRUD + search
- [x] Order workflow
- [x] Reviews + trust score
- [x] Merchant dashboard UI
- [ ] Public marketplace frontend (browsing for consumers)
- [ ] Customer mobile app (React Native)
- [ ] Real-time chat (WebSockets)
- [ ] Push notifications
- [ ] AI recommendations
- [ ] Logistics integration (shipping APIs)
- [ ] Admin panel
- [ ] Multi-language (English)

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/hossamnassem22/gfos-core/issues)
- **Discussions:** [GitHub Discussions](https://github.com/hossamnassem22/gfos-core/discussions)

---

Built with ❤️ for the Egyptian and Arabic-speaking markets.
