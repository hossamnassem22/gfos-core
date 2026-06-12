# Selfni Core Status

## Current Release
v0.5.0

## Completed

### Authentication
- JWT Register
- JWT Login
- Protected Routes

### Customer Registry
- customers table
- customer_id linked to debt_agreements
- tenant isolation

### Debt Management
- FLAT_RATE
- DECLINING_BALANCE
- BALLOON

### Schedule Engine
- amortization_schedule generation
- payment allocation

### Payments
- waterfall distribution
- payment tracking

### Statements
- statement endpoint
- customer balances

### Overdue System
- OverdueEngine
- InstallmentOverdue events
- financial_events jsonb
- idempotency protection

### Dashboard
- dashboard_installments
- view_overdue_report
- dashboard_overdue_summary
- overdue frontend screen

### Scheduler
- daily overdue processing
- 00:05 execution

## Database Objects

### Tables
- users
- customers
- debt_agreements
- amortization_schedule
- payments
- financial_events
- ledger_entries

### Views
- dashboard_installments
- view_overdue_report
- dashboard_overdue_summary

## Next Milestones

### Phase 1
Customer Workspace
- customer list screen
- customer details screen
- customer portfolio summary

### Phase 2
Notifications
- upcoming installment reminders
- overdue reminders
- escalation reminders

### Phase 3
Analytics
- top overdue customers
- collection performance
- cashflow forecast
- portfolio health

### Phase 4
Penalty Engine
- configurable penalty rules
- penalty events
- penalty ledger postings

## Production Readiness Checklist

- [x] Auth
- [x] Tenant Isolation
- [x] Customer Registry
- [x] Debt Agreements
- [x] Payment Engine
- [x] Statement Engine
- [x] Overdue Engine
- [x] Scheduler
- [x] Dashboard API
- [x] Dashboard Frontend
- [ ] Notifications
- [ ] Analytics
- [ ] Penalty Engine
