// src/core/PaymentWaterfall.ts
// ═══════════════════════════════════════════════════════════════
// PAYMENT WATERFALL — توزيع الدفعة بالأولوية البنكية
// الترتيب: غرامات تأخير → فوائد مستحقة → أصل القرض
// ═══════════════════════════════════════════════════════════════

export interface WaterfallInput {
  paymentMillimes:              bigint;
  outstandingPenaltyMillimes:   bigint;
  outstandingInterestMillimes:  bigint;
  outstandingPrincipalMillimes: bigint;
}

export interface WaterfallResult {
  penaltyPaidMillimes:    bigint;
  interestPaidMillimes:   bigint;
  principalPaidMillimes:  bigint;
  changeMillimes:         bigint;  // مردود للعميل لو دفع زيادة
  isFullySettled:         boolean;
  remainingDebtMillimes:  bigint;
}

export function applyWaterfall(input: WaterfallInput): WaterfallResult {
  let remaining = input.paymentMillimes;

  // 1. غرامات
  const penaltyPaid   = remaining >= input.outstandingPenaltyMillimes
    ? input.outstandingPenaltyMillimes : remaining;
  remaining -= penaltyPaid;

  // 2. فوائد
  const interestPaid  = remaining >= input.outstandingInterestMillimes
    ? input.outstandingInterestMillimes : remaining;
  remaining -= interestPaid;

  // 3. أصل
  const principalPaid = remaining >= input.outstandingPrincipalMillimes
    ? input.outstandingPrincipalMillimes : remaining;
  remaining -= principalPaid;

  const change = remaining;

  const remainingDebt =
    (input.outstandingPenaltyMillimes   - penaltyPaid)  +
    (input.outstandingInterestMillimes  - interestPaid) +
    (input.outstandingPrincipalMillimes - principalPaid);

  return {
    penaltyPaidMillimes:   penaltyPaid,
    interestPaidMillimes:  interestPaid,
    principalPaidMillimes: principalPaid,
    changeMillimes:        change,
    isFullySettled:        remainingDebt === 0n,
    remainingDebtMillimes: remainingDebt,
  };
}

// غرامة التأخير اليومية
export function calculatePenalty(params: {
  overdueMillimes:  bigint;
  dailyPenaltyBps:  number;  // e.g. 5 = 0.05% يومياً
  daysOverdue:      number;
}): bigint {
  if (params.daysOverdue <= 0) return 0n;
  if (params.dailyPenaltyBps <= 0) return 0n;
  const dailyPenalty = (params.overdueMillimes * BigInt(params.dailyPenaltyBps)) / 10000n;
  return dailyPenalty * BigInt(params.daysOverdue);
}
