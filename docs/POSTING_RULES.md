# 🔄 POSTING RULES

## قواعس محرك الترحيل

هناك طريقة واحدة فقط للترحيل. هذه هي.

---

## Rule 1: Single Entry Point

```typescript
// src/core/posting-engine/posting-engine.ts
export class PostingEngine {
  async post(request: PostingRequest): Promise<PostingResult> {
    // This is THE ONLY way to affect ledger
  }
}

// There is NO other way:
// ❌ ledger.directInsert()
// ❌ db.query('INSERT INTO journal_entries')
// ❌ repository.save()
```

---

## Rule 2: PostingRequest Contract

```typescript
interface PostingRequest {
  // Identification
  tenantId: TenantId;           // ✅ Required
  description: string;           // ✅ Required
  effectiveDate: Date;           // ✅ Required
  
  // Ledger lines
  lines: LedgerLine[];           // ✅ Required (min 2)
  
  // Audit
  createdBy: UserId;             // ✅ Required (who)
  reason?: string;               // ⚠️ Required for reversals
  
  // Idempotency
  idempotencyKey: string;        // ✅ Required (CRITICAL)
  
  // Metadata
  sourceEntity?: string;         // Optional: 'loan-123', 'payment-456'
  sourceEvent?: string;          // Optional: 'LoanCreated', 'PaymentReceived'
}

interface LedgerLine {
  accountId: string;             // ✅ Required
  debitAmount: Money;            // BigInt (NEVER float)
  creditAmount: Money;           // BigInt (NEVER float)
  currency: string;              // ✅ Required
  description?: string;          // Optional line-level description
}
```

---

## Rule 3: Pre-Posting Validation

```typescript
async function prePostingValidation(
  request: PostingRequest
): Promise<ValidationResult> {
  const validations = [
    // 1. Tenant validation
    {
      name: 'Tenant exists',
      fn: () => validateTenant(request.tenantId)
    },
    
    // 2. User validation
    {
      name: 'User has permission',
      fn: () => validateUserPermission(request.createdBy, request.tenantId)
    },
    
    // 3. Date validation
    {
      name: 'Effective date is not future',
      fn: () => validateEffectiveDate(request.effectiveDate)
    },
    
    // 4. Period validation
    {
      name: 'Period is open',
      fn: () => validatePeriodOpen(request.tenantId, request.effectiveDate)
    },
    
    // 5. Double-entry validation
    {
      name: 'Debit = Credit',
      fn: () => validateDoubleEntry(request.lines)
    },
    
    // 6. Account validation
    {
      name: 'All accounts exist',
      fn: () => validateAccountsExist(request.lines, request.tenantId)
    },
    
    // 7. Account type validation (can't post to header accounts)
    {
      name: 'All accounts are detail level',
      fn: () => validateAccountType(request.lines)
    },
    
    // 8. Idempotency key validation
    {
      name: 'Idempotency key is unique',
      fn: () => validateIdempotencyKey(request.idempotencyKey, request.tenantId)
    }
  ];
  
  for (const validation of validations) {
    const result = await validation.fn();
    if (!result.passed) {
      throw new PostingValidationError(
        validation.name,
        result.error
      );
    }
  }
}
```

---

## Rule 4: Idempotency Handling

### Critical: Same request must produce same result

```typescript
async function handleIdempotency(
  request: PostingRequest
): Promise<PostingResult> {
  // Check if already posted
  const existing = await db.query(
    `SELECT * FROM journal_entries
     WHERE tenant_id = $1 AND idempotency_key = $2`,
    [request.tenantId, request.idempotencyKey]
  );
  
  if (existing.rows.length > 0) {
    // Already posted - return existing result
    return {
      journalEntryId: existing.rows[0].id,
      status: 'ALREADY_POSTED',
      warning: 'Duplicate request ignored'
    };
  }
  
  // First time - proceed with posting
  return await proceedWithPosting(request);
}
```

### Database Support:
```sql
ALTER TABLE journal_entries
ADD CONSTRAINT unique_idempotency_key_per_tenant
UNIQUE (tenant_id, idempotency_key);
```

---

## Rule 5: The Posting Algorithm

```typescript
async function post(request: PostingRequest): Promise<PostingResult> {
  return await transaction(async (client) => {
    // Step 1: Validate
    await prePostingValidation(request);
    
    // Step 2: Check idempotency
    const existing = await checkIdempotency(request);
    if (existing) return existing;
    
    // Step 3: Get next entry number
    const entryNumber = await getNextEntryNumber(request.tenantId);
    
    // Step 4: Create entry in DRAFT status
    const entryId = uuid();
    await client.query(
      `INSERT INTO journal_entries
       (id, tenant_id, entry_number, description, posting_date, status, effective_date, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, NOW())`,
      [entryId, request.tenantId, entryNumber, request.description, 'DRAFT', request.effectiveDate, request.createdBy]
    );
    
    // Step 5: Insert journal lines
    for (const line of request.lines) {
      const lineId = uuid();
      await client.query(
        `INSERT INTO journal_lines
         (id, journal_entry_id, account_id, debit_amount, credit_amount, currency, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [lineId, entryId, line.accountId, line.debitAmount, line.creditAmount, line.currency, line.description]
      );
    }
    
    // Step 6: Transition to POSTED
    await client.query(
      `UPDATE journal_entries
       SET status = $1, posted_at = NOW(), posted_by = $2
       WHERE id = $3`,
      ['POSTED', request.createdBy, entryId]
    );
    
    // Step 7: Record audit
    await recordAudit(client, {
      entityType: 'JOURNAL_ENTRY',
      entityId: entryId,
      action: 'POSTED',
      userId: request.createdBy,
      afterState: {
        id: entryId,
        entryNumber,
        description: request.description,
        lines: request.lines,
        status: 'POSTED'
      }
    });
    
    // Step 8: Record event
    await recordEvent(client, {
      tenantId: request.tenantId,
      eventType: 'JOURNAL_POSTED',
      aggregateId: entryId,
      payload: {
        entryId,
        entryNumber,
        description: request.description,
        totalAmount: calculateTotalAmount(request.lines),
        sourceEntity: request.sourceEntity,
        sourceEvent: request.sourceEvent
      },
      idempotencyKey: request.idempotencyKey
    });
    
    // Step 9: Return success
    return {
      journalEntryId: entryId,
      entryNumber,
      status: 'POSTED',
      message: 'Journal entry posted successfully'
    };
  });
}
```

---

## Rule 6: Post-Posting Validation

```typescript
async function postPostingValidation(
  tenantId: string,
  entryId: string
): Promise<void> {
  // 1. Verify entry was posted
  const entry = await ledger.get(entryId);
  if (entry.status !== 'POSTED') {
    throw new PostingError('Entry not in POSTED status');
  }
  
  // 2. Verify debit = credit
  const totals = await ledger.calculateTotals(entryId);
  if (totals.debit !== totals.credit) {
    throw new PostingError('Debit does not equal credit');
  }
  
  // 3. Verify all lines were inserted
  const lineCount = await ledger.countLines(entryId);
  if (lineCount === 0) {
    throw new PostingError('No journal lines found');
  }
  
  // 4. Verify ledger is still balanced
  const balanced = await ledger.verifyBalance(tenantId);
  if (!balanced) {
    throw new PostingError('Ledger imbalance detected after posting');
  }
}
```

---

## Rule 7: Reversal Posting

```typescript
async function reverse(
  originalEntryId: string,
  tenantId: string,
  reason: string,
  reversedBy: UserId
): Promise<PostingResult> {
  // Validate original entry
  const originalEntry = await ledger.get(originalEntryId);
  
  if (originalEntry.status !== 'POSTED') {
    throw new PostingError(
      'CANNOT_REVERSE_UNPOSTED',
      `Cannot reverse ${originalEntry.status} entry`
    );
  }
  
  if (originalEntry.tenantId !== tenantId) {
    throw new PostingError('TENANT_MISMATCH', 'Tenant does not match');
  }
  
  // Create reversal entry (mirror of original)
  const reversalRequest: PostingRequest = {
    tenantId,
    description: `Reversal of JE-${originalEntry.entry_number}: ${reason}`,
    effectiveDate: new Date(), // Today
    createdBy: reversedBy,
    reason: reason,
    idempotencyKey: `reversal-${originalEntryId}-${Date.now()}`,
    lines: originalEntry.lines.map(line => ({
      accountId: line.accountId,
      debitAmount: line.creditAmount,  // Flip
      creditAmount: line.debitAmount,  // Flip
      currency: line.currency,
      description: `Reversal: ${line.description}`
    })),
    sourceEntity: originalEntryId,
    sourceEvent: 'REVERSAL'
  };
  
  // Post reversal entry
  const reversalResult = await post(reversalRequest);
  
  // Mark original as REVERSED
  await db.query(
    `UPDATE journal_entries
     SET status = $1, reversal_of_id = $2
     WHERE id = $3`,
    ['REVERSED', reversalResult.journalEntryId, originalEntryId]
  );
  
  return reversalResult;
}
```

---

## Rule 8: Error Handling

```typescript
class PostingEngine {
  async post(request: PostingRequest): Promise<PostingResult> {
    try {
      // Attempt posting
      return await this.doPosting(request);
    } catch (error) {
      if (error instanceof PostingValidationError) {
        // Validation failed - log and rethrow
        await this.recordFailedAttempt(request, error);
        throw error;
      }
      
      if (error instanceof DatabaseError) {
        // Database constraint violation
        await this.recordFailedAttempt(request, error);
        throw new PostingError(
          'DATABASE_CONSTRAINT',
          error.message
        );
      }
      
      // Unknown error
      await this.recordFailedAttempt(request, error);
      throw new PostingError(
        'UNKNOWN_ERROR',
        'Posting failed with unexpected error'
      );
    }
  }
  
  private async recordFailedAttempt(
    request: PostingRequest,
    error: Error
  ): Promise<void> {
    await db.query(
      `INSERT INTO posting_failures
       (tenant_id, request_payload, error_message, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [request.tenantId, JSON.stringify(request), error.message]
    );
  }
}
```

---

## Rule 9: Atomic Transaction

```typescript
// ALL or NOTHING
await transaction(async (client) => {
  // If ANY step fails:
  // ✅ All changes rollback
  // ✅ Ledger remains consistent
  // ✅ No partial posting
  
  await insertEntry(client);
  await insertLines(client);
  await updateStatus(client);
  await recordAudit(client);
  await recordEvent(client);
  
  // If any throw: entire transaction rolls back
});
```

---

## Summary: Posting Guarantees

| Guarantee | Implementation | Verification |
|-----------|---|---|
| Single path | One PostingEngine class | Code review |
| Idempotent | Idempotency key unique constraint | Tests |
| Validated | Pre and post checks | Tests |
| Atomic | SQL transaction | Tests |
| Audited | Audit log insertion | Audit query |
| Immutable | DB triggers | DB test |
| Balanced | Debit = Credit | Ledger health check |
| Reversible | Reversal posting | Tests |
| Tenanted | Tenant_id in all queries | Security tests |

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE (Single source of all financial truth)
