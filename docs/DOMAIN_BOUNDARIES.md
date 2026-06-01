# 📍 DOMAIN BOUNDARIES

## الحدود المعمارية للنظام

كل Domain مستقل تماماً. **لا يمكن لـ Domain الوصول المباشر إلى جداول Domain آخر**.

---

## Core Layer (المشترك بين الجميع)

### Boundaries:
```
Databases:
  - users
  - tenants
  - roles
  - permissions
  - audit_logs
  - event_store

Services:
  - AuthenticationService
  - AuthorizationService
  - AuditService
  - ConfigService
  - NotificationService

APIs:
  - /auth/*
  - /config/*
```

### Access Rules:
```
✅ Can be accessed by: ALL domains
✅ Can access: Nothing (read-only)
❌ Can modify: Only through services
```

---

## Accounting Layer (القلب)

### Boundaries:
```
Databases:
  - accounts (Chart of Accounts)
  - journal_entries
  - journal_lines
  - fiscal_periods
  - accounting_templates

Services:
  - LedgerService
  - PostingEngine
  - AccountingMapper
  - PeriodManager

APIs:
  - /ledger/balance
  - /ledger/verify
  - /journal-entries (read-only)
```

### Access Rules:
```
✅ Can be accessed by: ALL domains (read ledger)
✅ Can access: Core layer
❌ Can modify: Only through PostingEngine
❌ Can access: Other domain tables directly
```

### Critical:
```
No other domain can:
- INSERT into journal_entries
- UPDATE journal_entries
- DELETE journal_entries
- Modify accounts

Must use: PostingEngine.post(request)
```

---

## Customer Layer

### Boundaries:
```
Databases:
  - customers
  - customer_kyc
  - customer_documents
  - customer_limits
  - customer_status_history

Services:
  - CustomerService
  - KYCService
  - DocumentService

APIs:
  - /customers/*
  - /kyc/*
  - /documents/*
```

### Access Rules:
```
✅ Can access: Core, Accounting (read)
❌ Can modify: Only own tables
❌ Can read: Loan, Payment, Risk domain tables
```

### Contract:
```typescript
export interface ICustomerService {
  getCustomer(id: string, tenantId: string): Promise<Customer>;
  createCustomer(data: CreateCustomerRequest): Promise<Customer>;
  updateCustomer(id: string, updates: UpdateCustomerRequest): Promise<Customer>;
  // No direct database access
}
```

---

## Lending Layer

### Boundaries:
```
Databases:
  - loans
  - loan_products
  - loan_schedules
  - loan_status_history
  - disbursements

Services:
  - LoanService
  - ScheduleService
  - InterestEngine
  - PenaltyEngine
  - DisbursementService

APIs:
  - /loans/*
  - /schedules/*
```

### Access Rules:
```
✅ Can access: Core, Accounting (read), Customer (read)
✅ Can call: FinancialEngine (pure functions)
✅ Can call: PostingEngine (to create ledger entries)
❌ Can modify: Only own tables
❌ Can read: Payment, Risk domain directly
```

### Events Published:
```
- LoanCreated
- LoanApproved
- LoanDisbursed
- InterestAccrued
- PenaltyApplied
- LoanRescheduled
```

---

## Payment Layer

### Boundaries:
```
Databases:
  - payments
  - payment_allocations
  - payment_methods
  - payment_status_history
  - payment_reversals

Services:
  - PaymentService
  - AllocationEngine
  - SettlementService
  - ReversalService

APIs:
  - /payments/*
  - /allocations/*
```

### Access Rules:
```
✅ Can access: Core, Accounting (read), Lending (read)
✅ Can call: FinancialEngine (allocation calculations)
✅ Can call: PostingEngine (to create ledger entries)
❌ Can modify: Only own tables
❌ Can read: Risk domain directly
```

### Events Published:
```
- PaymentReceived
- AllocationCreated
- AllocationReversed
- PaymentSettled
```

---

## Risk Layer

### Boundaries:
```
Databases:
  - limits
  - exposures
  - provisions
  - risk_assessments

Services:
  - RiskService
  - LimitService
  - ExposureService
  - ProvisioningService

APIs:
  - /risk/*
  - /limits/*
```

### Access Rules:
```
✅ Can access: Core, Accounting (read), Lending (read), Payment (read), Customer (read)
❌ Can modify: Only own tables
❌ Can write: To ledger (posting engine)
```

---

## Reporting Layer

### Boundaries:
```
Databases:
  - report_definitions
  - report_snapshots
  - balance_snapshots

Services:
  - ReportingService
  - SnapshotService
  - ExportService

APIs:
  - /reports/*
  - /exports/*
```

### Access Rules:
```
✅ Can access: ALL domains (read-only)
✅ Can create: Snapshots
❌ Can modify: Any domain tables
```

---

## Communication Between Domains

### ✅ ALLOWED:

```typescript
// Via APIs
const customer = await customerService.getCustomer(id);

// Via Events
event.subscribe('PaymentReceived', (payment) => {
  // react to payment
});

// Via Contracts (Interfaces)
interface ILoanService {
  getLoan(id: string): Promise<Loan>;
}
```

### ❌ FORBIDDEN:

```typescript
// Direct database access
await db.query('SELECT * FROM loans');

// Bypassing services
const loan = new Loan(...);
await loan.save();

// Accessing domain-specific tables
await paymentRepository.find(...);
```

---

## Service Contracts (Required from Day 1)

```typescript
// src/domains/core/contracts.ts
export interface ICustomerService {
  getCustomer(id: string, tenantId: string): Promise<Customer>;
  validateCustomerExists(id: string, tenantId: string): Promise<boolean>;
}

export interface ILedgerService {
  getBalance(accountId: string, tenantId: string, asOfDate?: Date): Promise<Money>;
  verifyBalance(tenantId: string): Promise<boolean>;
}

export interface ILoanService {
  getLoan(id: string, tenantId: string): Promise<Loan>;
  getSchedule(loanId: string): Promise<Schedule>;
}

export interface IPaymentService {
  recordPayment(request: PaymentRequest): Promise<Payment>;
  getAllocations(paymentId: string): Promise<Allocation[]>;
}
```

**All** communication goes through these interfaces.

---

## Architecture Violation Detection

These patterns are violations and will be caught in code review:

```typescript
// ❌ VIOLATION: Cross-domain direct access
import { loansTable } from '../lending/schema';
await loansTable.find(...);

// ❌ VIOLATION: Bypassing service
const payment = new Payment(...);
await db.query('INSERT INTO payments');

// ❌ VIOLATION: Service importing service from other domain
import { LoanRepository } from '../lending/repositories';

// ❌ VIOLATION: Direct table import in different domain
import { journalEntriesTable } from '../accounting/schema';
```

---

## Summary: The Grid

```
              | Core | Accounting | Customer | Lending | Payment | Risk | Reporting
              |------|------------|----------|---------|---------|------|----------
Core          |  ✅  |     ✅     |    ✅    |    ✅   |    ✅   |  ✅  |    ✅
Accounting    |  ✅  |     ✅     |    ⚠️    |    ⚠️   |    ⚠️   |  ⚠️  |    ⚠️
Customer      |  ✅  |     ⚠️     |    ✅    |    ❌   |    ❌   |  ❌  |    ⚠️
Lending       |  ✅  |     ⚠️     |    ⚠️    |    ✅   |    ❌   |  ❌  |    ⚠️
Payment       |  ✅  |     ⚠️     |    ⚠️    |    ⚠️   |    ✅   |  ❌  |    ⚠️
Risk          |  ✅  |     ⚠️     |    ⚠️    |    ⚠️   |    ⚠️   |  ✅  |    ⚠️
Reporting     |  ✅  |     ✅     |    ✅    |    ✅   |    ✅   |  ✅  |    ✅

Legend:
✅ = Full access (read/write own tables)
⚠️ = Read-only access
❌ = No access (use APIs/Events)
```

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE
