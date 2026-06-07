# Selfni Core

نظام ادارة الديون والائتمان - Deno/TypeScript + PostgreSQL

## التشغيل
- start.sh — تشغيل PostgreSQL + API
- stop.sh  — ايقاف كل شيء

## API

### Auth
- POST /auth/register
- POST /auth/login

### Customers
- POST /customers
- GET  /customers
- GET  /customers/:id

### Debts
- POST /debts
- GET  /debts/user/:userId

### Payments
- POST /payments

### Dashboard
- GET  /dashboard/installments
- GET  /dashboard/overdue
- GET  /dashboard/overdue-summary
- POST /dashboard/run-overdue

### Statement
- GET  /statement/:userId

### Calculate
- POST /calculate/interest
- POST /calculate/waterfall

## الجداول
- users, customers, debt_agreements
- amortization_schedule, payments
- financial_events, ledger_entries

## Views
- dashboard_installments
- view_overdue_report
- dashboard_overdue_summary

## Scheduler
يشتغل كل يوم 00:05 — PENDING -> OVERDUE -> InstallmentOverdue event

## انواع السداد
- FLAT_RATE, DECLINING_BALANCE, BALLOON
