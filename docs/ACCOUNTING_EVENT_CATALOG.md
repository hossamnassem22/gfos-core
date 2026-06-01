# 🎪 ACCOUNTING EVENT CATALOG

## فهرس الأحداث المالية المعرّفة بدقة

كل حدث مالي يجب أن يكون موثقاً بالكامل قبل التنفيذ.

---

## Event: DEBT_CREATED

```typescript
interface DebtCreatedEvent {
  // Event metadata
  eventId: string;                    // Unique identifier
  eventType: 'DEBT_CREATED';          // Event type (immutable)
  version: number;                    // Schema version (currently 1)
  tenantId: string;                   // Multi-tenancy isolation
  aggregateId: string;                // Debt ID (primary key)
  occurredAt: Date;                   // When it happened
  recordedAt: Date;                   // When it was recorded (≥ occurredAt)
  source: 'API' | 'SYSTEM' | 'BATCH';
  correlationId: string;              // Trace across system
  idempotencyKey: string;             // Exactly-once guarantee
  
  // Financial data
  payload: {
    debtId: string;
    customerId: string;
    principal: string;                // BigInt as string (e.g., "100000")
    currency: string;                 // ISO 4217 (e.g., "USD")
    interestRate: string;             // BPS as string (e.g., "1200000" = 12%)
    dayCountConvention: 'ACTUAL_365' | 'ACTUAL_360';
    effectiveDate: string;            // ISO 8601
    maturityDate?: string;            // ISO 8601 (optional)
    createdBy: string;                // User ID who initiated
    description?: string;             // Optional narrative
  };
  
  // Audit trail
  audit: {
    createdBy: string;
    createdAt: Date;
    ip?: string;
    userAgent?: string;
  };
  
  // Financial impact (calculated)
  financialImpact: {
    journalEntryId?: string;          // Link to ledger
    accountingTemplateId: string;     // Which template
    debitAccountId: string;
    creditAccountId: string;
  };
}
```

### Responsibilities:
- **FinancialEngine**: ❌ Not involved
- **Accounting Mapper**: Maps to journal template
- **PostingEngine**: Creates journal entry
- **Ledger**: Records immutably

### Subscribers:
- Risk Service (update exposure)
- Notification Service (send confirmation)
- Reporting Service (update dashboard)
- Compliance Service (regulatory reporting)

### Error Handling:
```
If customer doesn't exist → CUSTOMER_NOT_FOUND
If invalid currency → INVALID_CURRENCY
If negative principal → INVALID_AMOUNT
```

---

## Event: INTEREST_ACCRUED

```typescript
interface InterestAccruedEvent {
  eventId: string;
  eventType: 'INTEREST_ACCRUED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Accrual ID
  correlationId: string;              // Link to parent debt
  idempotencyKey: string;             // Exactly-once: debt-{id}-{date}
  
  payload: {
    debtId: string;
    accrualDate: string;              // ISO 8601
    accrualPeriodStart: string;       // ISO 8601
    accrualPeriodEnd: string;         // ISO 8601
    days: number;                     // Actual days accrued
    principal: string;                // BigInt as string
    rate: string;                     // BPS as string
    accruedAmount: string;            // Calculated interest
    currency: string;
    ruleId: string;                   // RULE_001_v1.0
    ruleVersion: string;              // 1.0 (versioned formula)
    dayCountConvention: string;
    calculationDetails: {
      formula: string;                // Mathematical formula used
      numerator: string;              // For audit
      denominator: string;            // For audit
    };
  };
  
  financialImpact: {
    journalEntryId?: string;
    accountingTemplateId: 'INTEREST_ACCRUAL';
    debitAccountId: string;           // Interest Receivable
    creditAccountId: string;          // Interest Income
  };
}
```

### Trigger:
- Daily job at EOD (End of Day)
- Per account, per currency
- Only if debt is in ACTIVE status

### Subscribers:
- PostingEngine (create journal entry)
- ReportingEngine (update accrual balances)
- RiskEngine (update interest exposure)

---

## Event: PENALTY_ACCRUED

```typescript
interface PenaltyAccruedEvent {
  eventId: string;
  eventType: 'PENALTY_ACCRUED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Penalty ID
  correlationId: string;              // Link to debt
  idempotencyKey: string;             // Exactly-once
  
  payload: {
    debtId: string;
    accrualDate: string;              // ISO 8601
    daysOverdue: number;              // Days past due date
    overdueAmount: string;            // BigInt as string
    penaltyRate: string;              // BPS as string
    accruedPenalty: string;           // Calculated penalty
    currency: string;
    ruleId: string;                   // RULE_002_v1.0
    ruleVersion: string;              // 1.0
    dayCountConvention: string;
  };
  
  financialImpact: {
    journalEntryId?: string;
    accountingTemplateId: 'PENALTY_ACCRUAL';
    debitAccountId: string;           // Penalties Receivable
    creditAccountId: string;          // Penalty Income
  };
}
```

### Trigger:
- Daily job when due date passed
- Per account

### Subscribers:
- PostingEngine
- ReportingEngine
- RiskEngine (risk increase)

---

## Event: PAYMENT_RECEIVED

```typescript
interface PaymentReceivedEvent {
  eventId: string;
  eventType: 'PAYMENT_RECEIVED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Payment ID
  correlationId: string;              // Link to debt
  idempotencyKey: string;             // Exactly-once
  
  payload: {
    paymentId: string;
    debtId: string;
    customerId: string;
    paymentDate: string;              // ISO 8601
    valueDate: string;                // ISO 8601 (settlement date)
    amount: string;                   // BigInt as string (cash received)
    currency: string;
    method: 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'CARD';
    transactionRef: string;           // External reference
    status: 'PENDING' | 'CLEARED' | 'REJECTED';
  };
  
  allocationBreakdown?: {
    fees: string;
    interest: string;
    penalties: string;
    principal: string;
  };
  
  financialImpact: {
    journalEntryId?: string;
    accountingTemplateId: 'PAYMENT_RECEIVED';
  };
}
```

### Workflow:
1. Payment received → PAYMENT_RECEIVED event
2. Waterfall allocation calculated
3. ALLOCATION_CREATED event
4. JOURNAL_POSTED event

### Subscribers:
- AllocationEngine
- PostingEngine
- CashReconciliation
- ReportingEngine

---

## Event: PAYMENT_ALLOCATED

```typescript
interface PaymentAllocatedEvent {
  eventId: string;
  eventType: 'PAYMENT_ALLOCATED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Allocation ID
  correlationId: string;              // Link to payment
  idempotencyKey: string;             // Exactly-once
  
  payload: {
    allocationId: string;
    paymentId: string;
    debtId: string;
    allocationDate: string;           // ISO 8601
    allocations: {
      fees: string;                   // BigInt as string
      interest: string;
      penalties: string;
      principal: string;
      total: string;                  // Sum of all
    };
    currency: string;
    ruleId: string;                   // RULE_003_v1.0 (waterfall)
    ruleVersion: string;              // 1.0
    allocationOrder: [
      'FEES',
      'INTEREST',
      'PENALTIES',
      'PRINCIPAL'
    ];
  };
  
  financialImpact: {
    journalEntryId?: string;
    accountingTemplateId: 'PAYMENT_ALLOCATION';
  };
}
```

### Constraints:
- Sum of allocations must equal payment amount
- Waterfall order is immutable
- Each component traceable

---

## Event: JOURNAL_POSTED

```typescript
interface JournalPostedEvent {
  eventId: string;
  eventType: 'JOURNAL_POSTED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Journal Entry ID
  correlationId?: string;             // Optional link to source event
  idempotencyKey: string;             // Ledger-level idempotency
  
  payload: {
    journalEntryId: string;
    entryNumber: number;              // Sequential, per tenant
    description: string;
    postingDate: string;              // ISO 8601 (today)
    effectiveDate: string;            // ISO 8601 (when it happened)
    valueDate?: string;               // ISO 8601 (cash date)
    status: 'DRAFT' | 'POSTED' | 'REVERSED';
    
    lines: [
      {
        lineId: string;
        accountId: string;
        accountCode: string;          // Chart of Accounts code
        accountName: string;
        debitAmount: string;          // BigInt as string
        creditAmount: string;         // BigInt as string
        currency: string;
        description?: string;
      }
    ];
    
    totals: {
      totalDebits: string;            // Verified equal
      totalCredits: string;           // Verified equal
    };
    
    audit: {
      postedBy: string;               // User ID
      postedAt: Date;
      approvedBy?: string;            // If required
      approvedAt?: Date;
    };
    
    sourceEntity?: string;            // What created this ('debt-123')
    sourceEvent?: string;             // Which event caused it
  };
}
```

### Validation:
- Debit = Credit
- All accounts exist
- Period is open
- Idempotency key unique

### Subscribers:
- Ledger (immutable append)
- AuditLog
- ReportingEngine

---

## Event: LEDGER_VALIDATED

```typescript
interface LedgerValidatedEvent {
  eventId: string;
  eventType: 'LEDGER_VALIDATED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Validation run ID
  
  payload: {
    validationDate: string;           // ISO 8601
    period: string;                   // "2026-05" or "2026"
    checks: [
      {
        checkName: string;
        checkId: string;
        passed: boolean;
        details?: string;
      }
    ];
    
    summary: {
      totalDebits: string;
      totalCredits: string;
      balanced: boolean;
      orphanEntries: number;
      invalidAccounts: number;
      successRate: number;              // Percentage
    };
  };
}
```

### Checks Performed:
- Debit = Credit (per period)
- No orphan entries
- All accounts exist
- No negative balances (for assets)
- Sequential entry numbers
- No duplicate idempotency keys

---

## Event: RECONCILIATION_COMPLETED

```typescript
interface ReconciliationCompletedEvent {
  eventId: string;
  eventType: 'RECONCILIATION_COMPLETED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Reconciliation run ID
  
  payload: {
    reconciliationDate: string;       // ISO 8601
    reconciliationType: 'BANK' | 'SYSTEM' | 'CROSS_SYSTEM';
    sourceSystem: string;             // Which system
    
    results: {
      totalAmount: string;
      matched: number;
      unmatched: number;
      variance: string;               // If any
      status: 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';
    };
    
    adjustments?: [
      {
        adjustmentId: string;
        description: string;
        amount: string;
        journalEntryId?: string;      // If posted
      }
    ];
  };
}
```

---

## Event: ACCOUNT_STATEMENT_GENERATED

```typescript
interface AccountStatementGeneratedEvent {
  eventId: string;
  eventType: 'ACCOUNT_STATEMENT_GENERATED';
  version: number;
  tenantId: string;
  aggregateId: string;                // Statement ID
  
  payload: {
    debtId: string;
    statementDate: string;            // ISO 8601 (statement as-of date)
    period: {
      from: string;                   // ISO 8601
      to: string;                     // ISO 8601
    };
    
    summary: {
      openingBalance: string;
      totalInterestAccrued: string;
      totalPenalties: string;
      totalPayments: string;
      closingBalance: string;
      daysOverdue: number;
    };
    
    generatedAt: Date;
    fileUrl?: string;                 // If exported
  };
}
```

---

## Universal Event Rules

### All Events MUST Have:
```typescript
✅ eventId (UUID)
✅ eventType (immutable)
✅ version (schema version)
✅ tenantId (isolation)
✅ aggregateId (primary entity)
✅ occurredAt (when it happened)
✅ recordedAt (when recorded)
✅ correlationId (trace across system)
✅ idempotencyKey (exactly-once)
✅ audit metadata
```

### Event Immutability:
```
❌ Events are NEVER updated
❌ Events are NEVER deleted
✅ Only correction is new event with reason
```

### Event Ordering:
```
1. Financial Engine produces calculation result
2. Accounting Mapper produces mapping
3. Journal Template produces structure
4. PostingEngine produces journal entry
5. Ledger appends immutably
6. Event recorded
7. Subscribers notified
```

### Event Publishing Guarantee:
```
At-least-once to subscribers
Exactly-once to Event Store
Exactly-once to Ledger
```

---

## Event Schema Versioning

```typescript
// If adding field in future
interface DebtCreatedEvent_v2 {
  // All v1 fields
  ...
  // New field
  newField: string;
}

// Code handles both versions
switch(event.version) {
  case 1: handleV1(event);
  case 2: handleV2(event);
}
```

---

## Testing Events

```typescript
// Every event schema must have tests:
test('DebtCreatedEvent conforms to schema', () => {
  const event = createValidDebtCreatedEvent();
  expect(validateEventSchema(event)).toBe(true);
});

test('Invalid event rejected', () => {
  const invalid = { eventType: 'INVALID' };
  expect(() => validateEventSchema(invalid)).toThrow();
});
```

---

**Last Updated:** 2026-06-01
**Status:** ACTIVE (Immutable reference)
**Next:** JOURNAL_TEMPLATE_CATALOG.md
