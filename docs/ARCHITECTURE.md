# Architecture

## Stack
- Runtime:  Deno/TypeScript
- HTTP:     Fastify (port 3011)
- Database: PostgreSQL
- Auth:     JWT
- Frontend: HTML/JS port 5173

## الطبقات
Frontend -> Fastify API -> Application -> Domain/Core -> Infrastructure/PostgreSQL

## دورة حياة القسط
دين -> AmortizationEngine -> PENDING -> OverdueEngine -> OVERDUE -> InstallmentOverdue Event -> Dashboard

## Tenant Isolation
- user_id في كل جدول
- JWT يحمل userId
- customers.tenant_id

## Money
- bigint millimes فقط
- لا floating point

## Events
- financial_events jsonb payload
- Idempotency UNIQUE constraint
