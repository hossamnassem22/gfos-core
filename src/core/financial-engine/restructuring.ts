import { Money } from "@core/precision/value-objects.ts";
import { AmortizationEngine, AmortizationScheduleRow, AmortizationType } from "@core/financial-engine/amortization.ts";
import { FinancialEngine } from "@core/financial-engine/financial-engine.ts";

export interface RestructuringInput {
  // الدين الأصلي
  originalPrincipalCents: bigint;
  currency: string;

  // الوضع الحالي للدين المتعثر
  outstandingPrincipalCents: bigint;
  accruedInterestCents: bigint;
  accruedPenaltiesCents: bigint;

  // شروط إعادة الجدولة
  newAnnualRateBps: number;
  newTermMonths: number;
  newStartDate: Date;
  newType: AmortizationType;

  // خصومات اختيارية
  interestWaiverBps?: number;  // نسبة إسقاط الفوائد
  penaltyWaiverBps?: number;   // نسبة إسقاط الغرامات
}

export interface RestructuringResult {
  // ما تم إسقاطه
  waivedInterestCents: bigint;
  waivedPenaltiesCents: bigint;

  // الرصيد الجديد بعد الإسقاط
  newPrincipalCents: bigint;

  // جدول السداد الجديد
  schedule: AmortizationScheduleRow[];

  // ملخص التكلفة
  totalNewPayment: bigint;
  totalNewInterest: bigint;
  savingsVsOriginal: bigint;
}

export class DebtRestructuringEngine {
  private amortization = new AmortizationEngine();

  restructure(input: RestructuringInput): RestructuringResult {
    // 1. حساب الإسقاطات
    const interestWaiverBps = BigInt(input.interestWaiverBps ?? 0);
    const penaltyWaiverBps  = BigInt(input.penaltyWaiverBps ?? 0);

    const waivedInterest  = input.accruedInterestCents  * interestWaiverBps / 10000n;
    const waivedPenalties = input.accruedPenaltiesCents * penaltyWaiverBps  / 10000n;

    // 2. الرصيد الجديد = أصل متبقي + فوائد بعد الإسقاط + غرامات بعد الإسقاط
    const remainingInterest  = input.accruedInterestCents  - waivedInterest;
    const remainingPenalties = input.accruedPenaltiesCents - waivedPenalties;
    const newPrincipal = input.outstandingPrincipalCents + remainingInterest + remainingPenalties;

    // 3. توليد جدول السداد الجديد
    const schedule = this.amortization.generate({
      principalCents: newPrincipal,
      currency: input.currency,
      annualRateBps: input.newAnnualRateBps,
      termMonths: input.newTermMonths,
      startDate: input.newStartDate,
      type: input.newType,
    });

    const { totalPayment, totalInterest } = this.amortization.totalCost(schedule);

    // 4. المقارنة مع لو استمر الدين بدون إعادة جدولة
    const originalTotalIfNoRestructure =
      input.outstandingPrincipalCents +
      input.accruedInterestCents +
      input.accruedPenaltiesCents;

    const savings = originalTotalIfNoRestructure > totalPayment
      ? originalTotalIfNoRestructure - totalPayment
      : 0n;

    return {
      waivedInterestCents:   waivedInterest,
      waivedPenaltiesCents:  waivedPenalties,
      newPrincipalCents:     newPrincipal,
      schedule,
      totalNewPayment:       totalPayment,
      totalNewInterest:      totalInterest,
      savingsVsOriginal:     savings,
    };
  }
}
