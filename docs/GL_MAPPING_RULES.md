# 💰 GL MAPPING RULES

## Chart of Accounts Mapping - External Configuration

**CRITICAL:** GL account codes are NOT hardcoded. They are CONFIGURED per product/tenant.

This prevents:
- Redeploying code to change accounts
- Mixing different chart structures
- Product-specific GL mappings

---

## GL Account Structure

```typescript
interface ChartOfAccounts {
  // Master list of GL accounts
  accounts: [
    {
      accountId: string;              // UUID
      accountCode: string;            // "1100"
      accountName: string;            // "Customer A/R"
      accountType: string;            // "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
      subType: string;                // "CURRENT_ASSET" | "LOAN_RECEIVABLE" | etc.
      currency: string;               // "USD" | "EUR" | "MULTI"
      normalBalance: 'DEBIT' | 'CREDIT';  // Debit-normal assets, Credit-normal liabilities
      parent?: string;                // "1000" (for account hierarchy)
      isActive: boolean;
      isDetail: boolean;              // true = can post to, false = header only
    }
  ];
}
```

---

## Standard Account Chart (Example)

```
1000 — ASSETS
  1010 — Cash on Hand
  1100 — Customer A/R (Accounts Receivable)
  1110 — Interest Receivable
  1120 — Penalties Receivable
  1130 — Fees Receivable
  1200 — Loan Portfolio (Off-Balance Asset)
  1210 — Loan Loss Provision (Contra-Asset)
  1300 — Other Receivables

2000 — LIABILITIES
  2100 — Customer Deposits
  2110 — Interest Payable
  2200 — Accrued Expenses

3000 — EQUITY
  3100 — Capital Stock
  3200 — Retained Earnings

4000 — REVENUE
  4100 — Debt Revenue (Principal Recognition)
  4110 — Interest Income (Accrual Basis)
  4120 — Penalty Income
  4130 — Fee Income
  4200 — Miscellaneous Income

5000 — EXPENSE
  5100 — Loan Loss Expense
  5200 — Operating Expense
```

---

## Mapping Rules (Per Product)

### Configuration Database

```typescript
interface GLMappingConfiguration {
  // Database table: gl_mappings
  
  configs: [
    {
      id: string;                     // UUID
      tenantId: string;               // Multi-tenant isolation
      productId: string;              // "PRODUCT_A" | "PRODUCT_B"
      
      // Map logical accounts to GL codes
      mappings: {
        CUSTOMER_AR: string;          // "1100"
        INTEREST_RECEIVABLE: string;  // "1110"
        PENALTIES_RECEIVABLE: string; // "1120"
        FEES_RECEIVABLE: string;      // "1130"
        
        CASH_ACCOUNT: string;         // "1010"
        LOAN_ASSET: string;           // "1200"
        LOAN_LOSS_PROVISION: string;  // "1210"
        
        DEBT_REVENUE: string;         // "4100"
        INTEREST_INCOME: string;      // "4110"
        PENALTY_INCOME: string;       // "4120"
        FEE_INCOME: string;           // "4130"
      };
      
      effectiveDate: Date;            // When this mapping starts
      expiryDate?: Date;              // When superseded
      
      audit: {
        createdBy: string;            // User ID
        createdAt: Date;
        approvedBy?: string;          // Requires approval
        approvedAt?: Date;
      };
    }
  ];
}
```

---

## Example: Product A vs Product B

### Product A (Standard)
```
Tenant: BANK_A
Product: PERSONAL_LOANS

Customer A/R      → 1100
Interest Income   → 4110
Penalty Income    → 4120
Cash              → 1010
```

### Product B (Different Structure)
```
Tenant: BANK_A
Product: COMMERCIAL_LOANS

Customer A/R      → 1050  (different code!)
Interest Income   → 4200  (different code!)
Penalty Income    → 4210  (different code!)
Cash              → 1001  (different code!)
```

**Both use the same FinancialEngine, same templates, different GL mappings.**

---

## How It Works in Code

### Step 1: Financial Engine Calculates
```typescript
const interest = calculateDailyInterest(
  principal,
  rate,
  days
);
// Returns: Money (3,288 cents)
```

### Step 2: Accounting Mapper Gets GL Account
```typescript
const glMapping = await getGLMapping(
  tenantId,
  productId,
  'INTEREST_RECEIVABLE'
);
// Returns: "1110" (account code)

const accountId = await getAccountId('1110');
// Returns: UUID of account record
```

### Step 3: Apply Journal Template
```typescript
const template = getTemplate('INTEREST_ACCRUAL');
const lines = template.render({
  interest: {
    accruedAmount: interest,
    debitAccountId: glMapping.INTEREST_RECEIVABLE,
    creditAccountId: glMapping.INTEREST_INCOME
  }
});
// Lines now have correct GL accounts
```

### Step 4: PostingEngine Posts
```typescript
const journalEntry = await postingEngine.post({
  lines: lines,  // With correct GL accounts
  idempotencyKey: 'accrual-debt-123-2026-06-01'
});
// Posted to ledger
```

---

## Mapping Query in Code

```typescript
// Service to get GL account
export class GLMappingService {
  async getGLAccount(
    tenantId: string,
    productId: string,
    logicalAccountName: string,  // "CUSTOMER_AR"
    asOfDate?: Date              // For historical mapping
  ): Promise<{
    accountCode: string;         // "1100"
    accountId: string;           // UUID
    accountName: string;         // "Customer A/R"
  }> {
    const mapping = await db.query(
      `SELECT mappings->'${logicalAccountName}' as code
       FROM gl_mappings
       WHERE tenant_id = $1
       AND product_id = $2
       AND effective_date <= $3
       AND (expiry_date IS NULL OR expiry_date > $3)
       ORDER BY effective_date DESC
       LIMIT 1`,
      [tenantId, productId, asOfDate || new Date()]
    );
    
    if (!mapping) {
      throw new MappingNotFoundError(
        `GL mapping not found: ${logicalAccountName}`
      );
    }
    
    const accountCode = mapping.code;
    const account = await this.getAccountByCode(accountCode);
    
    return {
      accountCode,
      accountId: account.id,
      accountName: account.name
    };
  }
}
```

---

## Mapping Validation Rules

### Rule 1: All Mappings Must Exist
```typescript
test('All required GL mappings exist', () => {
  const requiredMappings = [
    'CUSTOMER_AR',
    'INTEREST_RECEIVABLE',
    'PENALTIES_RECEIVABLE',
    'FEES_RECEIVABLE',
    'CASH_ACCOUNT',
    'DEBT_REVENUE',
    'INTEREST_INCOME',
    'PENALTY_INCOME',
    'FEE_INCOME'
  ];
  
  for (const mapping of requiredMappings) {
    const account = getGLAccount(tenantId, productId, mapping);
    expect(account).toBeDefined();
    expect(account.accountCode).toBeTruthy();
  }
});
```

### Rule 2: Account Types Must Match
```typescript
// INTEREST_RECEIVABLE must map to ASSET
const account = getAccount('1110');
expect(account.type).toBe('ASSET');

// INTEREST_INCOME must map to REVENUE
const account = getAccount('4110');
expect(account.type).toBe('REVENUE');
```

### Rule 3: Currency Must Match
```typescript
// If posting in USD, all GL accounts must support USD
const accounts = getGLAccounts(['1100', '4110']);
for (const account of accounts) {
  expect(['USD', 'MULTI'].includes(account.currency)).toBe(true);
}
```

### Rule 4: No Circular Mappings
```
Account A → Account B
Account B → Account A  ❌ INVALID
```

---

## Mapping Changes (Zero-Downtime)

### Adding New Mapping

```sql
-- Step 1: Create new mapping effective future date
INSERT INTO gl_mappings (
  tenant_id,
  product_id,
  mappings,
  effective_date,
  expiry_date
) VALUES (
  'BANK_A',
  'PERSONAL_LOANS',
  '{
    "CUSTOMER_AR": "1100",
    "INTEREST_INCOME": "4110",
    ...
  }',
  '2026-07-01',  -- Future date
  NULL
);

-- Step 2: Expire old mapping
UPDATE gl_mappings
SET expiry_date = '2026-07-01'
WHERE tenant_id = 'BANK_A'
AND product_id = 'PERSONAL_LOANS'
AND expiry_date IS NULL;

-- Step 3: Automatic rollover at effective date
-- No code deployment needed
-- Future postings use new mapping
-- Historical postings use old mapping
```

---

## Mapping Audit Trail

```typescript
interface MappingChangeLog {
  id: UUID;
  tenant_id: string;
  product_id: string;
  old_mapping: object;              // Full JSON
  new_mapping: object;              // Full JSON
  changed_by: string;               // User ID
  changed_at: Date;
  reason: string;                   // Why changed
  effective_date: Date;             // When it takes effect
  approved_by: string;              // Approval required
  approved_at: Date;
}
```

---

## Multi-Tenant Isolation

```
❌ WRONG:
const account = getGLAccount('CUSTOMER_AR');
// What if 2 tenants use different codes?

✅ CORRECT:
const account = getGLAccount(tenantId, productId, 'CUSTOMER_AR');
// Explicit tenant isolation
```

---

## GL Mapping Import/Export

### Export for Audit
```typescript
export async function exportGLMappings(
  tenantId: string,
  asOfDate?: Date
): Promise<string> {
  const mappings = await db.query(
    `SELECT * FROM gl_mappings
     WHERE tenant_id = $1
     AND effective_date <= $2
     AND (expiry_date IS NULL OR expiry_date > $2)`,
    [tenantId, asOfDate || new Date()]
  );
  
  return JSON.stringify(mappings, null, 2);
}
```

### Import from External System
```typescript
import async function importGLMappings(
  tenantId: string,
  mappingsJSON: string,
  approver: string
): Promise<void> {
  const parsed = JSON.parse(mappingsJSON);
  
  // Validate
  await validateMappingsSchema(parsed);
  
  // Insert
  await db.query(
    `INSERT INTO gl_mappings
     (tenant_id, product_id, mappings, effective_date, created_by, approved_by)
     VALUES ($1, $2, $3, NOW(), $4, $5)`,
    [tenantId, parsed.productId, parsed.mappings, getCurrentUser(), approver]
  );
}
```

---

## Critical: GL Mapping is NOT Hardcoded

```typescript
// ❌ FORBIDDEN: Hardcoded GL account
function postInterestAccrual(interest: Money) {
  return ledger.post({
    debit: '1110',     // ❌ HARDCODED
    credit: '4110'     // ❌ HARDCODED
  });
}

// ✅ CORRECT: From GL_MAPPING service
function postInterestAccrual(
  interest: Money,
  tenantId: string,
  productId: string
) {
  const glMapping = await glMappingService.getGLMapping(
    tenantId,
    productId,
    'INTEREST_ACCRUAL'
  );
  
  return ledger.post({
    debit: glMapping.debitAccountId,      // ✅ FROM CONFIG
    credit: glMapping.creditAccountId     // ✅ FROM CONFIG
  });
}
```

---

## Summary: GL Mapping Hierarchy

```
1. Journal Template
   ├─ Says "post DR to CUSTOMER_AR"
   └─ Logical account name

2. GL Mapping Service
   ├─ Looks up GL_MAPPINGS table
   ├─ tenant_id + product_id + effective_date
   └─ Returns: "1100" (account code)

3. Account Registry
   ├─ Looks up accounts table
   ├─ account_code = "1100"
   └─ Returns: account_id (UUID)

4. Ledger
   ├─ Posts to account_id
   ├─ Creates immutable entry
   └─ Done
```

---

**Last Updated:** 2026-06-01
**Status:** ACTIVE (External configuration, not code)
**Next:** Create accounting-integration.test.ts
