# 🧾 ACCOUNTING TEMPLATES

## قوالب القيود المحاسبية

بدلاً من كتابة القيود يدوياً، استخدم قوالب معرّفة مسبقاً.

---

## Template: DEBT_CREATION

```typescript
export const DEBT_CREATION_TEMPLATE = {
  templateId: 'DEBT_CREATION',
  description: 'When a new debt is created',
  lines: [
    {
      accountCode: '1100',  // Accounts Receivable
      accountName: 'Customer AR',
      side: 'DEBIT',
      amount: '${debt.principal}'
    },
    {
      accountCode: '4100',  // Debt Revenue
      accountName: 'Debt Revenue',
      side: 'CREDIT',
      amount: '${debt.principal}'
    }
  ]
};

// Usage:
const lines = applyTemplate(
  DEBT_CREATION_TEMPLATE,
  { debt: { principal: 1_000_000n } }
);
```

---

## Template: INTEREST_ACCRUAL

```typescript
export const INTEREST_ACCRUAL_TEMPLATE = {
  templateId: 'INTEREST_ACCRUAL',
  description: 'Daily interest accrual',
  lines: [
    {
      accountCode: '1200',  // Interest Receivable
      side: 'DEBIT',
      amount: '${interest.accrued}'
    },
    {
      accountCode: '4200',  // Interest Income
      side: 'CREDIT',
      amount: '${interest.accrued}'
    }
  ]
};
```

---

## Template: PAYMENT_ALLOCATION

```typescript
export const PAYMENT_ALLOCATION_TEMPLATE = {
  templateId: 'PAYMENT_ALLOCATION',
  description: 'When payment is allocated',
  lines: [
    // DR Cash Received
    {
      accountCode: '1010',  // Cash
      side: 'DEBIT',
      amount: '${payment.total}'
    },
    // CR Accounts Receivable
    {
      accountCode: '1100',  // AR
      side: 'CREDIT',
      amount: '${allocation.principal}'
    },
    // CR Interest Receivable
    {
      accountCode: '1200',  // Interest Receivable
      side: 'CREDIT',
      amount: '${allocation.interest}'
    },
    // CR Penalties Payable
    {
      accountCode: '1300',  // Penalties
      side: 'CREDIT',
      amount: '${allocation.penalties}'
    }
  ]
};
```

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE
