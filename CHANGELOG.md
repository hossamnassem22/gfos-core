# Changelog

All notable changes to GFOS Platform will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased] — feat/gfos-marketplace

### Added
- **Marketplace API** (src/interfaces/http/routes/marketplace.ts)
  - Merchant registration + login (multi-tenant auto-creation)
  - Merchant profile CRUD
  - Merchant dashboard with KPIs, top products, low stock, sales chart
  - Product catalog with Arabic full-text search, filters (category, price, city, merchant)
  - Sort options: newest, price_asc, price_desc, popular, rating
  - Product CRUD with ownership checks
  - Order workflow (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED)
  - Auto stock deduction on order confirmation
  - Reviews with verified-purchase badges
  - Merchant replies to reviews
  - Auto-update of product/merchant ratings
- **Merchant Dashboard UI** (frontend/merchant.html)
  - Self-contained 52KB SPA with Arabic RTL
  - Login/Register tabs with full validation
  - 4 main pages: Dashboard, Products, Orders, Profile
  - Modal-based product form
  - Order status workflow with smart next-status buttons
  - Responsive (mobile-friendly)
  - Toast notifications
  - Cairo font for Arabic
- **Database Schema** (migrations/001_gfos_full_schema.sql)
  - Extended `merchants` with location, trust score, verification, plan
  - Extended `customers` with address, geo, trust score
  - New `categories` table (hierarchical, multi-language, icons)
  - Extended `products` with SKU, cost, compare_at_price, multi-images, tags, weight, dimensions, ratings, Arabic search index
  - New `orders` + `order_items` with full lifecycle + payment tracking
  - New `reviews` (1-5 + merchant replies + verified flag)
  - New `conversations` + `messages` (chat with attachments)
  - New `notifications` (typed: NEW_ORDER, etc.)
  - New `cart_items` (persistent cart)
  - New `trust_events` (trust score change history)
  - New `audit_logs` (full change history)
  - Views: `view_portfolio_health`, `view_overdue_report`, `view_merchant_dashboard`
  - Triggers: auto-update `updated_at`, auto-generate order numbers, auto-deduct stock
  - Seed data: 8 default categories
  - Indexes on all FKs + multi-tenant columns
- **Documentation**
  - Complete README.md rewrite (API reference, setup, structure)
  - Comprehensive changelog

### Changed
- `deno.json` — unified config with tasks (start, dev, test, lint, fmt)
- `package.json` — simplified (Deno-based, no Node deps)
- `src/interfaces/http/server.ts` — modular route delegation to marketplace.ts
- Removed duplicate `src/infrastructure/db/connection.ts`
- Moved `schema.sql` → `migrations/001_gfos_full_schema.sql`

### Removed
- `legacy/` directory (CausalFrontier, CommitEngine, etc.) → archived
- Standalone kernel experiments (GenesisKernel.ts, SnapshotEngine.ts, etc.)
- Rust coinductive_kernel.rs (out of scope)
- Standalone root .ts files (coinductive_kernel, journal-entry, ledger-line)
- Unused shell scripts (cleanup, install, debug, etc.)
- .bak files (package.json, index.html, server.ts)

---

## [v0.5.0] — 2026-06-07 (Selfni Core baseline)

### Added
- **JWT Auth**: Register/Login
- **Customer Registry** with tenant isolation
- **Debt Management**: FLAT, DECLINING, BALLOON amortizations
- **Amortization Schedule Engine**
- **Payment Waterfall** with allocation
- **OverdueEngine**: PENDING → OVERDUE
- **OverdueScheduler**: daily at 00:05
- **Dashboard API**: portfolio, overdue, overdue-summary
- **Views**: dashboard_installments, view_overdue_report
- **Statement API** with balance calculation
- **Frontend**: Login, Dashboard, Debt Creation, Account Statement

---

## Future (Roadmap)

- [ ] Public consumer marketplace UI
- [ ] Customer mobile app (React Native + Expo)
- [ ] Real-time chat (WebSockets)
- [ ] Push notifications (FCM/APNS)
- [ ] AI features (recommendations, forecasting)
- [ ] Logistics integration
- [ ] Admin panel
- [ ] Multi-language support
- [ ] Payment gateway integration (after regulatory approval)
