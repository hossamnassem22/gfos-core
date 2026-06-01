# 🏗️ GFOS CORE - ARCHITECTURE CONSTITUTION

## الدستور المعماري للنظام المالي العالمي

هذه الوثيقة تحتوي على القواعس الحديدية التي **لا يجوز كسرها** إلا بموافقة صريحة مكتوبة.

---

## القاعدة الأساسية #0 - Rule Zero

```
لا يجوز تنفيذ أي عملية مالية أو تعديل رصيد أو إنشاء التزام مالي 
أو الاعتراف بإيراد أو مصروف إلا من خلال:

Transaction Service
  ↓
Financial Engine (Pure calculations)
  ↓
Accounting Mapper (Map to GL)
  ↓
Posting Engine (Create journal entries)
  ↓
Ledger (Immutable truth)
```

أي انحراف عن هذا المسار = خطأ هندسي يستوجب رفع PR غير صحيح.

---

## القاعدة #1: Ledger is the Single Source of Truth

### ✅ ALLOWED:
```typescript
// Balance derived from ledger
const balance = await ledger.calculateBalance(accountId, tenantId, asOfDate);

// Balance cached with expiry
const cachedBalance = await cache.get(balanceKey);
if (!cachedBalance) {
  cachedBalance = await ledger.calculateBalance(...);
  await cache.set(balanceKey, cachedBalance, TTL_1_HOUR);
}
```

### ❌ FORBIDDEN:
```typescript
// Storing balance as truth
await db.query(`UPDATE accounts SET balance = balance + 100 WHERE id = $1`);

// Using balance without ledger verification
const balance = account.current_balance; // Direct field access as truth
```

### الإجراء إذا تم الانتهاك:
- PR رفع فوري
- Code Review يرفضها
- لا يُسمح بالمرج

---

## القاعدة #2: No Direct Balance Updates

### ✅ ALLOWED:
```typescript
// Every balance change = Journal Entry
await ledger.post({
  debit: { accountId: CUSTOMER_AR, amount: 100 },
  credit: { accountId: REVENUE, amount: 100 },
  description: 'Debt created'
});

// Balance updated automatically as ledger artifact
const newBalance = await ledger.calculateBalance(CUSTOMER_AR);
// newBalance = 100
```

### ❌ FORBIDDEN:
```typescript
// Direct SQL update
await db.query(`UPDATE accounts SET balance = balance + 100`);

// Direct object field modification
account.balance = account.balance + 100;
await account.save();

// Bypassing ledger
await db.query(`UPDATE customer_balances SET amount = amount + 100`);
```

---

## القاعدة #3: All Financial Logic in FinancialEngine Only

### ✅ ALLOWED:
```typescript
// src/core/financial-engine/interest-calculator.ts
export function calculateDailyInterest(
  principal: Money,
  rate: Percentage,
  days: number
): Money {
  // Pure calculation
  // No DB access
  // No side effects
}
```

### ❌ FORBIDDEN:
```typescript
// In controller
app.post('/interest', async (req, res) => {
  const interest = calculateInterest(loan.principal); // ❌ HERE
});

// In service mixed with business logic
class PaymentService {
  processPayment() {
    const interest = loan.principal * loan.rate; // ❌ HERE
  }
}

// In database
-- SQL
SELECT principal * rate AS interest; -- ❌ HERE
```

---

## القاعدة #4: Every Financial Impact Requires Journal Entry

### Impact Examples:
- Creating a loan
- Receiving a payment
- Accruing interest
- Charging a penalty
- Allocating payment
- Writing off debt
- Reversing transaction
- Modifying rate
- Changing effective date

### ✅ ALLOWED:
```typescript
// Any impact must create ledger entries
const journalEntryId = await ledger.post({
  entries: [
    { debit: accountA, amount: 100 },
    { credit: accountB, amount: 100 }
  ]
});
```

### ❌ FORBIDDEN:
```typescript
// Changing data without ledger impact
debt.status = 'PAID'; // ❌ No journal entry
await debt.save();

customer.creditLimit = 50000; // ❌ No audit entry
await customer.save();

loan.interestRate = 0.12; // ❌ No record of change
await loan.save();
```

---

## القاعدة #5: Ledger Entries Are Immutable After Posting

### ✅ ALLOWED:
```typescript
// Reversal (creates new entries)
await ledger.reverse(journalEntryId, reason);

// Adjustment (creates new entries)
await ledger.createAdjustment(correction);

// Query/Read
const entries = await ledger.getEntries(conditions);
```

### ❌ FORBIDDEN:
```typescript
// UPDATE posted entry
await db.query(`UPDATE journal_entries SET amount = $1 WHERE id = $2`);

// DELETE posted entry
await db.query(`DELETE FROM journal_entries WHERE id = $1`);

// Modifying ledger_lines
await db.query(`UPDATE journal_lines SET debit_amount = $1 WHERE id = $2`);
```

### الاستثناء الوحيد:
- Reversal entries (إضافة، لا تعديل)
- Correction entries (إضافة، لا تعديل)

---

## القاعدة #6: All Posting Goes Through Posting Engine

### Single Entry Point:
```typescript
// src/core/posting-engine/posting-engine.ts
export class PostingEngine {
  async post(request: PostingRequest): Promise<JournalEntryId> {
    // Validate
    // Map to GL accounts
    // Create entries
    // Post to ledger
    // Record event
    // Record idempotency
  }
}
```

### ✅ ALLOWED:
```typescript
const entryId = await postingEngine.post({
  description: 'Interest accrual',
  lines: [...],
  idempotencyKey: 'unique-id',
  effectiveDate: date
});
```

### ❌ FORBIDDEN:
```typescript
// Bypassing posting engine
await ledger.directPost(...);
await db.query('INSERT INTO journal_entries');
await journalRepository.save(entry);
```

---

## القاعدة #7: No Float/Double In Financial Calculations

### ✅ ALLOWED:
```typescript
type Money = bigint; // Always

const principal: Money = 1000_00n; // $1000.00 in cents
const rate: BigInt = 12_000_000n; // 12% as 12000000 (12 * 1000000)
const days: number = 365;

const interest = (principal * rate / 1000000n) / 365n;
// Pure integer arithmetic
```

### ❌ FORBIDDEN:
```typescript
const principal: number = 1000.00; // ❌ float
const rate: number = 0.12; // ❌ float
const interest = principal * rate; // ❌ float multiplication

const balance: number = 1000.50; // ❌ javascript number
const percentage: number = parseFloat('12.5'); // ❌ float
```

---

## القاعدة #8: All Financial Operations Must Be Idempotent

### Requirement:
```
Same input + Same idempotency_key = Same result
Even if called 1000 times
```

### ✅ ALLOWED:
```typescript
const payment = await paymentService.recordPayment({
  loanId: 'loan-1',
  amount: 10000n,
  idempotencyKey: 'pay-2026-001' // REQUIRED
});

// Call 1: Creates entry, returns id1
// Call 2: Finds existing, returns id1 (same)
// Call 3: Finds existing, returns id1 (same)
```

### ❌ FORBIDDEN:
```typescript
// No idempotency key
await paymentService.recordPayment({
  loanId: 'loan-1',
  amount: 10000n
  // Missing idempotency key
});

// Call 1: Creates
// Call 2: Creates again (duplicate!)
```

---

## القاعدة #9: Tenant Isolation is Absolute

### ✅ ALLOWED:
```typescript
// Every query must have tenant_id
await ledger.getBalance(accountId, tenantId); // Required
await customer.find(customerId, tenantId); // Required
```

### ❌ FORBIDDEN:
```typescript
// Any query without tenant_id = bug
await ledger.getBalance(accountId); // ❌ Missing tenantId
await customer.find(customerId); // ❌ Missing tenantId

// Cross-tenant queries
await db.query('SELECT * FROM customers'); // ❌ Could leak data
```

---

## القاعدة #10: Audit Trail is Non-Negotiable

كل عملية مالية يجب أن يكون لها:

```typescript
interface AuditEntry {
  who: UserId;           // ✅ Required
  when: Date;            // ✅ Required
  what: EntityType;      // ✅ Required
  action: Action;        // ✅ Required
  before: StateSnapshot; // ✅ Required
  after: StateSnapshot;  // ✅ Required
  ip: string;            // ✅ Required
  reason: string;        // ✅ Required for sensitive ops
}
```

---

## Summary: The Non-Negotiables

| Rule | Enforcement | Violation Impact |
|------|-------------|------------------|
| SSoT | Code Review | PR Rejected |
| No Direct Updates | SQL Constraints | Insert/Update Fails |
| FinancialEngine Only | Code Review | PR Rejected |
| Every Impact = Entry | Unit Tests | Tests Fail |
| Immutable Ledger | DB Constraints | Update/Delete Fails |
| Posting Engine Path | Code Review | PR Rejected |
| No Float | TypeScript Types | Compilation Fails |
| Idempotency | Logic Tests | Duplicates Detected |
| Tenant Isolation | Query Patterns | Data Leakage Caught |
| Audit Trail | Database Triggers | Missing Entry Detected |

---

## When Can These Rules Be Changed?

✅ **Only if:**
1. Written proposal in GitHub Issues
2. Architectural review discussion
3. Consensus from team leads
4. Updated documentation
5. Backward compatibility plan
6. Affected tests updated
7. All existing code complies

❌ **Never for convenience**
❌ **Never for "just this once"**
❌ **Never to meet a deadline**

---

## Enforcement

Every PR must have:
- ✅ No violations of these rules
- ✅ Updated audit trail
- ✅ Tests pass
- ✅ Financial correctness verified

If any rule is violated: **PR is rejected automatically**.

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE (No exceptions)
