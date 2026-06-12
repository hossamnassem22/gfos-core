import { Money } from "@core/precision/value-objects.ts";

export interface PaymentAllocation {
  penalties: Money;
  interest: Money;
  principal: Money;
  remaining: Money;
}

export interface WaterfallInput {
  payment: Money;
  outstandingPenalties: Money;
  outstandingInterest: Money;
  outstandingPrincipal: Money;
}

export class PaymentWaterfall {
  /**
   * توزيع الدفعة بالترتيب: غرامات → فوائد → أصل
   * Banking-grade: كل مرحلة تأخذ ما تحتاجه أو ما تبقى
   */
  allocate(input: WaterfallInput): PaymentAllocation {
    const currency = input.payment.currency;
    let remaining = input.payment;

    // المرحلة 1: الغرامات
    const penaltyPaid = this.takeUpTo(remaining, input.outstandingPenalties);
    remaining = remaining.subtract(penaltyPaid);

    // المرحلة 2: الفوائد
    const interestPaid = this.takeUpTo(remaining, input.outstandingInterest);
    remaining = remaining.subtract(interestPaid);

    // المرحلة 3: الأصل
    const principalPaid = this.takeUpTo(remaining, input.outstandingPrincipal);
    remaining = remaining.subtract(principalPaid);

    return {
      penalties: penaltyPaid,
      interest: interestPaid,
      principal: principalPaid,
      remaining,
    };
  }

  private takeUpTo(available: Money, owed: Money): Money {
    if (available.cents >= owed.cents) return owed;
    return available;
  }
}
