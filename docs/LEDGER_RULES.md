# 📚 LEDGER RULES

## قواعس دفتر الأستاذ العام

هذه القواعس حديدية ومطبقة على مستوى قاعدة البيانات والتطبيق.

---

## Rule 1: Debit = Credit ALWAYS

### Database Level:
```sql
-- Constraint that enforces it
ALTER TABLE journal_entries
ADD CONSTRAINT total_debits_equals_credits
CHECK (
  (SELECT COALESCE(SUM(debit_amount), 0) FROM journal_lines WHERE journal_entry_id = id)
  =
  (SELECT COALESCE(SUM(credit_amount), 0) FROM journal_lines WHERE journal_entry_id = id)
);
```

### Application Level:
```typescript
function validateDoubleEntry(lines: JournalLine[]): boolean {
  let totalDebit = 0n;
  let totalCredit = 0n;
  
  for (const line of lines) {
    totalDebit += line.debitAmount;
    totalCredit += line.creditAmount;
  }
  
  if (totalDebit !== totalCredit) {
    throw new FinancialRuleViolation(
      'DEBIT_CREDIT_MISMATCH',
      `Debits (${totalDebit}) != Credits (${totalCredit})`
    );
  }
  
  if (totalDebit === 0n) {
    throw new FinancialRuleViolation(
      'ZERO_AMOUNT_ENTRY',
      'Entry amount must be greater than zero'
    );
  }
  
  return true;
}
```

### Consequence if Broken:
```
❌ INSERT FAILS
❌ UPDATE FAILS
❌ APPLICATION THROWS ERROR
❌ ENTRY NOT CREATED
```

---

## Rule 2: Immutability After Posting

### Status Flow:
```
DRAFT
  ↓ (can edit)
POSTED
  ↓ (cannot edit, only reverse)
REVERSED
  ↓ (immutable)
```

### Database Constraints:
```sql
-- Only DRAFT entries can be updated
CREATE TRIGGER prevent_posted_entry_modification
BEFORE UPDATE ON journal_entries
FOR EACH ROW
WHEN (OLD.status = 'POSTED' OR OLD.status = 'REVERSED')
BEGIN
  SELECT RAISE(ABORT, 'Cannot modify posted or reversed journal entries');
END;

-- Ledger lines are append-only
CREATE TRIGGER prevent_journal_lines_modification
BEFORE UPDATE ON journal_lines
FOR EACH ROW
BEGIN
  SELECT RAISE(ABORT, 'Journal lines are immutable');
END;

-- No deletions from ledger
CREATE TRIGGER prevent_journal_entries_deletion
BEFORE DELETE ON journal_entries
FOR EACH ROW
BEGIN
  SELECT RAISE(ABORT, 'Journal entries cannot be deleted. Use reversal instead.');
END;
```

### Application Level:
```typescript
class LedgerEngine {
  async updateEntry(id: string, updates: any): Promise<void> {
    const entry = await ledger.get(id);
    
    if (entry.status !== 'DRAFT') {
      throw new FinancialRuleViolation(
        'ENTRY_NOT_EDITABLE',
        `Cannot modify ${entry.status} entry. Use reversal instead.`
      );
    }
    
    // Update allowed
  }
  
  async reverse(entryId: string, reason: string): Promise<JournalEntryId> {
    const originalEntry = await ledger.get(entryId);
    
    if (originalEntry.status !== 'POSTED') {
      throw new FinancialRuleViolation(
        'CANNOT_REVERSE_UNPOSTED',
        `Cannot reverse ${originalEntry.status} entry`
      );
    }
    
    // Create reversal entry
    const reversalEntry = createReversalEntry(originalEntry, reason);
    return await this.post(reversalEntry);
  }
}
```

---

## Rule 3: No Posting to Closed Periods

### Period Status:
```
OPEN
  ↓
SOFT_CLOSED (can still post with approval)
  ↓
HARD_CLOSED (cannot post)
  ↓
LOCKED (immutable)
```

### Application Level:
```typescript
async function validatePeriodOpen(
  tenantId: string,
  postingDate: Date,
  allowSoftClosed: boolean = false
): Promise<boolean> {
  const period = await periodManager.getPeriod(tenantId, postingDate);
  
  if (!period) {
    throw new FinancialRuleViolation(
      'PERIOD_NOT_FOUND',
      `No fiscal period for ${postingDate}`
    );
  }
  
  if (period.status === 'HARD_CLOSED' || period.status === 'LOCKED') {
    throw new FinancialRuleViolation(
      'PERIOD_CLOSED',
      `Cannot post to ${period.status} period ${period.name}`
    );
  }
  
  if (period.status === 'SOFT_CLOSED' && !allowSoftClosed) {
    throw new FinancialRuleViolation(
      'PERIOD_SOFT_CLOSED',
      `Soft closed period. Requires approval.`
    );
  }
  
  return true;
}
```

---

## Rule 4: Sequential Entry Numbers

### Requirement:
```
Entry numbers must be:
- Unique per tenant
- Sequential (no gaps)
- Immutable after posting
```

### Database:
```sql
CREATE SEQUENCE journal_entry_numbers_seq
OWNED BY journal_entries.id;

ALTER TABLE journal_entries
ADD CONSTRAINT unique_entry_number_per_tenant
UNIQUE (tenant_id, entry_number);
```

### Application:
```typescript
async function getNextEntryNumber(tenantId: string): Promise<bigint> {
  const result = await db.query(
    `SELECT COALESCE(MAX(entry_number), 0) + 1 as next_number
     FROM journal_entries
     WHERE tenant_id = $1
     FOR UPDATE`, // Lock to prevent race conditions
    [tenantId]
  );
  
  return BigInt(result.rows[0].next_number);
}
```

---

## Rule 5: Mandatory Audit Trail

### For Every Posting:
```typescript
interface AuditEntry {
  journalEntryId: string;
  who: UserId;              // ✅ Required
  when: Date;               // ✅ Required (created_at)
  what: string;             // ✅ Required (description)
  beforeSnapshot?: object;  // ✅ For updates
  afterSnapshot: object;    // ✅ Current state
  ip: string;               // ✅ Required
  reason: string;           // ✅ For reversals
}
```

### Database:
```sql
INSERT INTO audit_logs (
  tenant_id,
  entity_type,
  entity_id,
  action,
  after_state,
  user_id,
  ip_address,
  created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());
```

---

## Rule 6: Mandatory Effective Date

### Posting Date vs Effective Date:
```
Posting Date    = When entry was created in system
Effective Date  = When the financial impact occurred
Value Date      = When cash settlement happens (future)
```

### Application:
```typescript
interface JournalEntryRequest {
  postingDate: Date;     // Today (always)
  effectiveDate: Date;   // When did it happen?
  valueDate?: Date;      // When does cash settle? (optional)
}

// Validation
if (effectiveDate > today) {
  throw new FinancialRuleViolation(
    'INVALID_EFFECTIVE_DATE',
    'Effective date cannot be in the future'
  );
}

if (effectiveDate < period.startDate) {
  throw new FinancialRuleViolation(
    'DATE_OUTSIDE_PERIOD',
    'Effective date is outside fiscal period'
  );
}
```

---

## Rule 7: No Zero Amounts

### Validation:
```typescript
function validateAmounts(lines: JournalLine[]): void {
  for (const line of lines) {
    if (line.debitAmount < 0n || line.creditAmount < 0n) {
      throw new FinancialRuleViolation(
        'NEGATIVE_AMOUNT',
        'All amounts must be non-negative'
      );
    }
    
    if (line.debitAmount === 0n && line.creditAmount === 0n) {
      throw new FinancialRuleViolation(
        'ZERO_AMOUNT',
        'Line must have debit or credit amount'
      );
    }
    
    if (line.debitAmount > 0n && line.creditAmount > 0n) {
      throw new FinancialRuleViolation(
        'BOTH_DEBIT_CREDIT',
        'Line cannot have both debit and credit'
      );
    }
  }
}
```

---

## Rule 8: Tenant Isolation

### Every Query:
```typescript
// ✅ CORRECT
await ledger.getBalance(accountId, tenantId);

// ❌ WRONG
await ledger.getBalance(accountId);
```

### Database Level:
```sql
-- Row-level security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY journal_entries_tenant_isolation
ON journal_entries
FOR ALL
USING (tenant_id = current_user_tenant_id());
```

---

## Rule 9: Ledger Health Checks

### Daily Validation:
```typescript
async function validateLedgerHealth(tenantId: string): Promise<ValidationResult> {
  const checks = [
    {
      name: 'Total Debits = Total Credits',
      check: () => validateTotalBalance(tenantId)
    },
    {
      name: 'No Orphan Lines',
      check: () => validateNoOrphanLines(tenantId)
    },
    {
      name: 'No Negative Balances',
      check: () => validateNoNegativeAssets(tenantId)
    },
    {
      name: 'Sequential Entries',
      check: () => validateSequentialEntries(tenantId)
    }
  ];
  
  const results = await Promise.all(checks.map(c => c.check()));
  return new ValidationResult(checks, results);
}
```

---

## Summary: Ledger Protection

| Rule | DB Level | App Level | Consequence |
|------|----------|-----------|-------------|
| Debit = Credit | CHECK constraint | Validation | INSERT fails |
| Immutable Posted | TRIGGER | Guard clause | UPDATE fails |
| No Closed Posting | - | Validation | INSERT fails |
| Sequential Numbers | UNIQUE constraint | Sequence | Violation caught |
| Audit Trail | Trigger | Log insert | Gap detected |
| Effective Date | - | Validation | Reject posted |
| No Zero Amounts | - | Validation | Reject entry |
| Tenant Isolation | RLS | WHERE clause | Data leak prevented |
| Health Checks | - | Scheduled job | Alert if failed |

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE (Database constraints are HARD ENFORCED)
