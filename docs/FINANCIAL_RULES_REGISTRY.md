# 📊 FINANCIAL RULES REGISTRY

## سجل القواعس المالية

كل قاعدة مالية يجب أن يكون لها:
- **Rule ID**: معرف فريد
- **Version**: إصدار (يتغير عند التحديث)
- **Effective Date**: متى تبدأ هذه النسخة
- **Formula**: الصيغة الرياضية
- **Business Rule**: القاعدة المالية
- **Implementation**: الكود
- **Tests**: اختبارات
- **Documentation**: وثائق

---

## RULE_001: Daily Interest Calculation

### Business Rule:
```
الفائدة اليومية المتراكمة (Daily Accrual)
تُحسب كل يوم على الرصيد المتبقي
```

### Formula:
```
Daily Interest = (Principal × Annual Rate × Actual Days) / (Year Basis)

Example:
Principal = 1,000,000 (1,000,000 cents = $10,000)
Annual Rate = 12% = 1,200,000 (in basis points)
Days = 1
Year Basis = 365

Daily Interest = (1,000,000 × 12,000,000 / 1,000,000) / 365
               = 12,000,000 / 365
               = 32,876 cents
               = $328.76
```

### Implementation:
```typescript
// src/core/financial-engine/interest-calculator.ts

export function calculateDailyInterest(
  principal: Money,           // BigInt in cents
  annualRateBps: BigInt,      // Basis points (1200000 = 12%)
  days: number,               // Whole days
  convention: DayCountConvention = 'ACTUAL_365' // Can vary
): Money {
  // Validate inputs
  if (principal <= 0n) {
    throw new Error('Principal must be positive');
  }
  if (annualRateBps < 0n) {
    throw new Error('Rate cannot be negative');
  }
  if (days < 0) {
    throw new Error('Days cannot be negative');
  }
  
  // Choose basis
  const yearBasis = convention === 'ACTUAL_365' ? 365 : 360;
  
  // Calculate: (principal × rate) / yearBasis
  const numerator = principal * annualRateBps / 1_000_000n; // Remove BPS scale
  const interest = numerator / BigInt(yearBasis);
  
  // Round using Banker's rounding
  return bankersRound(interest);
}
```

### Tests:
```typescript
describe('RULE_001: Daily Interest Calculation', () => {
  test('Calculate daily interest on 10000 at 12% for 1 day', () => {
    const principal = 1_000_000n; // $10,000
    const rate = 1_200_000n;      // 12%
    const days = 1;
    
    const interest = calculateDailyInterest(principal, rate, days);
    
    expect(interest).toBe(32_876n); // $328.76
  });
  
  test('Calculate for multiple days', () => {
    const principal = 1_000_000n;
    const rate = 1_200_000n;
    const days = 30;
    
    const interest = calculateDailyInterest(principal, rate, days);
    
    expect(interest).toBe(986_301n); // ~$9,863
  });
});
```

### Version History:
```
Version 1.0 (2026-01-01)
- Initial implementation
- ACTUAL_365 basis only

Version 1.1 (2026-03-01)
- Added ACTUAL_360 support
- Added documentation
```

---

## RULE_002: Late Penalty Calculation

### Business Rule:
```
غرامة التأخير
تُحسب يومياً على الرصيد المتأخر
تزيد مع عدد أيام التأخير
```

### Formula:
```
Daily Penalty = (Principal × Penalty Rate × Days Late) / Year Basis

Example:
Principal (overdue) = 100,000 (100,000 cents = $1,000)
Penalty Rate = 2% = 200,000 BPS
Days Late = 10

Daily Penalty = (100,000 × 200,000 / 1,000,000) / 365
              = 20,000 / 365
              = 54 cents per day
              = $5.47 for 10 days
```

### Implementation:
```typescript
export function calculateLatePenalty(
  overdueAmount: Money,
  penaltyRateBps: BigInt,
  daysLate: number
): Money {
  if (overdueAmount <= 0n) {
    return 0n; // No penalty if no overdue
  }
  
  const numerator = overdueAmount * penaltyRateBps / 1_000_000n;
  const penalty = numerator * BigInt(daysLate) / 365n;
  
  return bankersRound(penalty);
}
```

---

## RULE_003: Waterfall Allocation

### Business Rule:
```
ترتيب التوزيع عند الدفع:
1. الرسوم المستحقة (Fees)
2. الفوائس المستحقة (Interest)
3. الغرامات (Penalties)
4. أصل الدين (Principal)
```

### Formula:
```
Payment = min(Payment, Fees) + min(Remaining, Interest) + 
          min(Remaining, Penalties) + min(Remaining, Principal)
```

### Implementation:
```typescript
export function allocatePayment(
  payment: Money,
  feesOutstanding: Money,
  interestOutstanding: Money,
  penaltiesOutstanding: Money,
  principalOutstanding: Money
): Allocation {
  let remaining = payment;
  const allocation: Allocation = {
    fees: 0n,
    interest: 0n,
    penalties: 0n,
    principal: 0n
  };
  
  // Priority 1: Fees
  allocation.fees = min(remaining, feesOutstanding);
  remaining -= allocation.fees;
  
  // Priority 2: Interest
  allocation.interest = min(remaining, interestOutstanding);
  remaining -= allocation.interest;
  
  // Priority 3: Penalties
  allocation.penalties = min(remaining, penaltiesOutstanding);
  remaining -= allocation.penalties;
  
  // Priority 4: Principal
  allocation.principal = min(remaining, principalOutstanding);
  
  return allocation;
}
```

---

## RULE_004: Banker's Rounding

### Business Rule:
```
تقريب البنكي (Round-to-Even)
عند التقريب للوحدة الأخيرة:
- إذا كانت القيمة = .5 تماماً → اقرب للعدد الزوجي
- وإلا → تقريب عادي
```

### Implementation:
```typescript
export function bankersRound(
  value: BigInt,
  decimals: number = 2
): BigInt {
  const factor = BigInt(Math.pow(10, decimals));
  const remainder = value % factor;
  
  if (remainder === 0n) {
    return value; // No rounding needed
  }
  
  const threshold = factor / 2n;
  
  if (remainder < threshold) {
    return value - remainder; // Round down
  } else if (remainder > threshold) {
    return value - remainder + factor; // Round up
  } else {
    // Exactly .5 - round to even
    const whole = value / factor;
    if (whole % 2n === 0n) {
      return whole * factor; // Round down to even
    } else {
      return (whole + 1n) * factor; // Round up to even
    }
  }
}
```

---

## RULE_005: Amortization Schedule

### Business Rule:
```
جدول الأقساط المنتظمة
كل قسط يتضمن:
- جزء من الفائدة
- جزء من أصل الدين
```

### Formula:
```
Payment = Principal × [r(1+r)^n] / [(1+r)^n - 1]

Where:
r = monthly rate
n = number of months
```

### Implementation:
```typescript
export function calculateAmortizationSchedule(
  principal: Money,
  annualRate: BigInt,
  months: number
): Installment[] {
  const monthlyRate = annualRate / 12n / 1_000_000n;
  const installments: Installment[] = [];
  
  let remainingBalance = principal;
  
  for (let i = 1; i <= months; i++) {
    const interestPayment = (remainingBalance * monthlyRate) / 1_000_000n;
    const principalPayment = calculateInstallmentPrincipal(
      principal,
      monthlyRate,
      months,
      i
    );
    
    remainingBalance -= principalPayment;
    
    installments.push({
      installmentNumber: i,
      dueDate: addMonths(today, i),
      principalAmount: principalPayment,
      interestAmount: interestPayment,
      totalAmount: principalPayment + interestPayment,
      remainingBalance: max(0n, remainingBalance)
    });
  }
  
  return installments;
}
```

---

## RULE_006: Accrual Posting

### Business Rule:
```
المحاسبة بأساس الاستحقاق
الفائدة والغرامات تُسجل عند استحقاقها
حتى لو لم تُقبض بعد
```

### Journal Entry:
```
DR Interest Receivable    XXX
  CR Interest Income      XXX
```

### Implementation (in PostingEngine):
```typescript
export async function postInterestAccrual(
  loanId: string,
  accruedInterest: Money,
  tenantId: string
): Promise<JournalEntryId> {
  return await postingEngine.post({
    tenantId,
    description: `Interest accrual for loan ${loanId}`,
    effectiveDate: today,
    lines: [
      {
        accountId: INTEREST_RECEIVABLE_ACCOUNT_ID,
        debitAmount: accruedInterest,
        creditAmount: 0n,
        currency: 'USD'
      },
      {
        accountId: INTEREST_INCOME_ACCOUNT_ID,
        debitAmount: 0n,
        creditAmount: accruedInterest,
        currency: 'USD'
      }
    ],
    createdBy: SYSTEM_USER_ID,
    idempotencyKey: `accrual-${loanId}-${dateToString(today)}`
  });
}
```

---

## Version Control Example

```typescript
// Track rule versions
interface FinancialRule {
  ruleId: string;        // RULE_001
  version: number;       // 1
  effectiveDate: Date;   // 2026-01-01
  expiryDate?: Date;     // 2026-03-01
  formula: string;       // Mathematical formula
  implementation: string; // Code location
  testCases: string[];   // Test file locations
}

// When calculating for historical transaction:
const rule = await rulesRegistry.getRule(
  'RULE_001',
  transactionDate // Get the version valid on this date
);

const interest = rule.implementation(
  principal,
  rate,
  days
);
```

---

## Summary

Every rule must have:
- ✅ Unique ID
- ✅ Mathematical formula
- ✅ Business justification
- ✅ Implementation
- ✅ Comprehensive tests
- ✅ Version history
- ✅ Effective dates

---

**Last Updated:** 2026-05-31
**Status:** ACTIVE (Immutable registry of all financial rules)
