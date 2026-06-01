# 📋 JOURNAL TEMPLATE CATALOG

## فهرس قوالب القيود المحاسبية المعرّفة بدقة

كل عملية مالية = قالب محاسبي واحد محدد مسبقاً.
**لا ارتجال. لا hardcoding. لا اجتهاد.**

---

## Template: DEBT_CREATION

```typescript
interface JournalTemplate {
  templateId: 'DEBT_CREATION';
  version: number;                    // 1
  effectiveDate: Date;                // 2026-01-01
  expiryDate?: Date;                  // When superseded
  
  description: string;                // "When new debt is created"
  ruleId: string;                     // Link to financial rule
  
  lines: [
    {
      lineNumber: number;             // 1
      accountCode: string;            // From GL_MAPPING_RULES
      side: 'DEBIT' | 'CREDIT';       // DEBIT
      amount: string;                 // Template variable: "${debt.principal}"
      description: string;            // "Customer A/R"
      mandatory: boolean;             // true
    },
    {
      lineNumber: number;             // 2
      accountCode: string;            // From GL_MAPPING_RULES
      side: 'DEBIT' | 'CREDIT';       // CREDIT
      amount: string;                 // Template variable: "${debt.principal}"
      description: string;            // "Debt Revenue"
      mandatory: boolean;             // true
    }
  ];
  
  validation: {
    requireDebitCreditBalance: boolean;  // true
    requireAllLinesNonZero: boolean;     // true
    allowCurrencyMismatch: boolean;      // false
  };
}
```

### Processing:
```typescript
const template = getTemplate('DEBT_CREATION');

const variables = {
  debt: {
    principal: Money.fromCents(1_000_000n, 'USD')
  }
};

const journalEntry = template.render(variables);
// Output:
// DR 1100 - Customer A/R: USD 1,000,000 cents
// CR 4100 - Debt Revenue: USD 1,000,000 cents
```

### Rules:
```
✅ DR Customer A/R = CR Debt Revenue
✅ Both in same currency
✅ Both non-zero
❌ No other accounts allowed
❌ No modifications at posting time
```

---

## Template: INTEREST_ACCRUAL

```typescript
interface JournalTemplate {
  templateId: 'INTEREST_ACCRUAL';
  version: number;                    // 1
  effectiveDate: Date;                // 2026-01-01
  
  description: string;                // "Daily interest accrual"
  ruleId: string;                     // RULE_001_v1.0
  
  lines: [
    {
      lineNumber: number;             // 1
      accountCode: string;            // From GL_MAPPING
      side: 'DEBIT';
      amount: string;                 // "${interest.accruedAmount}"
      description: string;            // "Interest Receivable"
      mandatory: boolean;             // true
    },
    {
      lineNumber: number;             // 2
      accountCode: string;            // From GL_MAPPING
      side: 'CREDIT';
      amount: string;                 // "${interest.accruedAmount}"
      description: string;            // "Interest Income"
      mandatory: boolean;             // true
    }
  ];
  
  variables: {
    required: ['interest.accruedAmount', 'interest.currency', 'debt.id'];
    optional: ['interest.ruleVersion', 'interest.daysPeriod'];
  };
}
```

### Processing:
```typescript
const accrual = {
  accruedAmount: Money.fromCents(3_288n, 'USD'),
  currency: 'USD',
  debtId: 'debt-123',
  ruleVersion: 'RULE_001_v1.0',
  daysPeriod: 1
};

const journalEntry = applyTemplate('INTEREST_ACCRUAL', { interest: accrual });
// DR 1200 Interest Receivable:  3,288 cents
// CR 4200 Interest Income:      3,288 cents
```

### Constraints:
```
✅ Debit = Credit
✅ Accrual-basis accounting (not cash)
✅ Per-day posting allowed
❌ Cannot be applied to non-active debts
❌ Cannot be negative
```

---

## Template: PENALTY_ACCRUAL

```typescript
interface JournalTemplate {
  templateId: 'PENALTY_ACCRUAL';
  version: number;                    // 1
  
  description: string;                // "Late penalty accrual"
  ruleId: string;                     // RULE_002_v1.0
  
  lines: [
    {
      lineNumber: number;             // 1
      accountCode: string;            // From GL_MAPPING
      side: 'DEBIT';
      amount: string;                 // "${penalty.accruedAmount}"
      description: string;            // "Penalties Receivable"
      mandatory: boolean;             // true
    },
    {
      lineNumber: number;             // 2
      accountCode: string;            // From GL_MAPPING
      side: 'CREDIT';
      amount: string;                 // "${penalty.accruedAmount}"
      description: string;            // "Penalty Income"
      mandatory: boolean;             // true
    }
  ];
}
```

---

## Template: PAYMENT_RECEIVED

```typescript
interface JournalTemplate {
  templateId: 'PAYMENT_RECEIVED';
  version: number;                    // 1
  
  description: string;                // "Cash payment received"
  ruleId: string;                     // RULE_003_v1.0 (Waterfall)
  
  // This template is COMPLEX because payment can be allocated multiple ways
  lines: [
    {
      lineNumber: number;             // 1
      accountCode: string;            // From GL_MAPPING (Cash)
      side: 'DEBIT';
      amount: string;                 // "${payment.totalAmount}"
      description: string;            // "Cash on Hand"
      mandatory: boolean;             // true
    },
    // Credit lines vary based on allocation
    {
      lineNumber: number;             // 2-N (dynamic)
      accountCode: string;            // Depends on allocation
      side: 'CREDIT';
      amount: string;                 // From allocation breakdown
      description: string;            // Varies
      mandatory: boolean;             // true
      conditional: {
        condition: string;            // "${allocation.principal} > 0"
        accountCodeIfTrue: string;    // AR account
      };
    },
    {
      lineNumber: number;             // Variable
      accountCode: string;            // Interest Receivable
      side: 'CREDIT';
      amount: string;                 // "${allocation.interest}"
      description: string;            // "Interest Received"
      mandatory: boolean;             // true
      conditional: {
        condition: string;            // "${allocation.interest} > 0"
      };
    },
    {
      lineNumber: number;             // Variable
      accountCode: string;            // Penalties Receivable
      side: 'CREDIT';
      amount: string;                 // "${allocation.penalties}"
      description: string;            // "Penalties Received"
      mandatory: boolean;             // true
      conditional: {
        condition: string;            // "${allocation.penalties} > 0"
      };
    },
    {
      lineNumber: number;             // Variable
      accountCode: string;            // Fees Receivable
      side: 'CREDIT';
      amount: string;                 // "${allocation.fees}"
      description: string;            // "Fees Received"
      mandatory: boolean;             // true
      conditional: {
        condition: string;            // "${allocation.fees} > 0"
      };
    }
  ];
  
  variables: {
    required: [
      'payment.totalAmount',
      'allocation.principal',
      'allocation.interest',
      'allocation.penalties',
      'allocation.fees'
    ];
  };
  
  validation: {
    requireDebitCreditBalance: boolean;  // true (CRITICAL)
    requireAllocationSumEqualsPayment: boolean;  // true
    allowZeroAllocations: boolean;      // true (some can be 0)
  };
}
```

### Processing:
```typescript
const payment = {
  totalAmount: Money.fromCents(500_000n, 'USD'),
  allocation: {
    fees: Money.fromCents(0n, 'USD'),
    interest: Money.fromCents(100_000n, 'USD'),
    penalties: Money.fromCents(50_000n, 'USD'),
    principal: Money.fromCents(350_000n, 'USD')
  }
};

const journalEntry = applyTemplate('PAYMENT_RECEIVED', { payment });
// DR 1010 Cash on Hand:                   500,000 cents
// CR 1100 Customer A/R:                   350,000 cents (principal)
// CR 1200 Interest Receivable:            100,000 cents
// CR 1300 Penalties Receivable:            50,000 cents
// (fees would be 0, not included)
// TOTAL DR = 500,000 | TOTAL CR = 500,000 ✓
```

---

## Template: LOAN_DISBURSEMENT

```typescript
interface JournalTemplate {
  templateId: 'LOAN_DISBURSEMENT';
  version: number;                    // 1
  
  description: string;                // "Disbursement of loan to customer"
  ruleId: string;                     // Financial rule
  
  lines: [
    {
      lineNumber: number;             // 1
      accountCode: string;            // From GL_MAPPING
      side: 'CREDIT';
      amount: string;                 // "${disbursement.amount}"
      description: string;            // "Cash Disbursed"
      mandatory: boolean;             // true
    },
    {
      lineNumber: number;             // 2
      accountCode: string;            // From GL_MAPPING
      side: 'DEBIT';
      amount: string;                 // "${disbursement.amount}"
      description: string;            // "Loan (off-balance)"
      mandatory: boolean;             // true
    }
  ];
}
```

### Note:
```
This is REVERSE of DEBT_CREATION because:
- Cash goes OUT (credit bank account)
- Loan asset created (debit)
- Both must balance
```

---

## Template: LOAN_WRITTEN_OFF

```typescript
interface JournalTemplate {
  templateId: 'LOAN_WRITTEN_OFF';
  version: number;                    // 1
  
  description: string;                // "Write-off of unrecoverable loan"
  ruleId: string;                     // Risk rule
  
  lines: [
    {
      lineNumber: number;             // 1
      accountCode: string;            // From GL_MAPPING (Provision)
      side: 'DEBIT';
      amount: string;                 // "${writeOff.amount}"
      description: string;            // "Loan Loss Provision"
      mandatory: boolean;             // true
    },
    {
      lineNumber: number;             // 2
      accountCode: string;            // From GL_MAPPING (AR)
      side: 'CREDIT';
      amount: string;                 // "${writeOff.amount}"
      description: string;            // "Customer A/R"
      mandatory: boolean;             // true
    }
  ];
}
```

---

## Template: REVERSAL (Meta-Template)

```typescript
interface ReversalTemplate {
  templateId: 'REVERSAL';
  description: string;                // "Reverse any journal entry"
  
  // Reversal flips all debits to credits and vice versa
  process: {
    sourceJournalEntryId: string;     // Which entry to reverse
    reversalReason: string;           // Why (audit)
    
    // Algorithm:
    // For each line in original entry:
    //   If DR → create CR with same amount
    //   If CR → create DR with same amount
    //   Flip account mappings if needed
  };
}
```

---

## Template Application Rules

### Rule 1: No Template = No Posting
```
If operation doesn't have template → REJECTED
No exceptions, no hardcoding
```

### Rule 2: Template Parameters are Immutable After Posting
```
Once applied to posting:
- Account codes locked
- Amount locked
- Line structure locked
```

### Rule 3: Template Versioning
```
If template changes:
- Create new version
- Old version remains for historical posting
- New postings use new version
```

### Rule 4: All Templates Must Have Tests
```typescript
test('DEBT_CREATION template balances', () => {
  const template = getTemplate('DEBT_CREATION');
  const debit = calculateTotalDebit(template);
  const credit = calculateTotalCredit(template);
  expect(debit).toBe(credit);
});
```

---

## Template Storage & Versioning

```typescript
interface TemplateRegistry {
  // Database:
  table: 'journal_templates';
  columns: {
    id: UUID;
    template_id: string;             // DEBT_CREATION
    version: number;                 // 1, 2, 3...
    effective_date: DATE;
    expiry_date: DATE;               // NULL if current
    definition: JSONB;               // Full template
    created_at: TIMESTAMP;
    created_by: STRING;              // Who defined it
  };
  
  // Queries:
  getTemplate(templateId, asOfDate) // Historical versions
  getCurrentTemplate(templateId)     // Latest active
}
```

---

## Template DSL (Domain Specific Language)

```typescript
// DSL for defining templates (human-readable)
const debtCreationDSL = `
Journal: DEBT_CREATION
Effective: 2026-01-01
Rule: RULE_001

Line 1: DEBIT
  Account: 1100 (from GL_MAPPING.CUSTOMER_AR)
  Amount: ${debt.principal}
  Description: Customer A/R
  
Line 2: CREDIT
  Account: 4100 (from GL_MAPPING.DEBT_REVENUE)
  Amount: ${debt.principal}
  Description: Debt Revenue

Validation:
  DebitCreditBalance: Required
  AllNonZero: Required
`;
```

---

## Critical Rule: Template Catalog is Law

```
🎯 The Golden Rule:

If you want to change how interest is posted,
do NOT change code.

Change the template version:
✅ INTEREST_ACCRUAL v1.0 → v1.1
✅ Effective date controlled
✅ Historical data unchanged
✅ Future postings use new template
✅ No code deployment needed
```

---

**Last Updated:** 2026-06-01
**Status:** ACTIVE (Templates are immutable law)
**Next:** GL_MAPPING_RULES.md
