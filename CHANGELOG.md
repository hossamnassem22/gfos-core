# Changelog

## v0.5.0 — 2026-06-07
- Customer Registry: جدول customers مع tenant_id
- ربط debt_agreements بـ customer_id
- OverdueEngine: PENDING -> OVERDUE
- InstallmentOverdue events
- اصلاح bug: double-stringified JSON payload
- Dashboard API: overdue, overdue-summary, run-overdue
- Views: view_overdue_report, dashboard_overdue_summary
- OverdueScheduler: يشتغل 00:05 يومياً
- Frontend: شاشة الاقساط المتاخرة

## v0.4.0 — مرحلة سابقة
- JWT Auth: Register/Login
- Debt Management: FLAT, DECLINING, BALLOON
- Payment Waterfall
- Statement API
- Financial Calculations
- Frontend: Login, Dashboard, دين جديد, كشف حساب
