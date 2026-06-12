import { Money } from "@core/precision/value-objects.ts";

export class FinancialEngine {
  calculateInterest(principal: Money, annualRate: { bps: number }, days: number): Money {
    const bps = BigInt(annualRate.bps);
    const daysBigInt = BigInt(days);
    const numerator = principal.cents * bps * daysBigInt;
    const denominator = 3650000n; // 100 * 365 * 100
    const interestCents = numerator / denominator;
    return Money.fromCents(interestCents, principal.currency);
  }

  calculatePenalty(overdueAmount: Money, penaltyRate: { bps: number }, daysLate: number): Money {
    const bps = BigInt(penaltyRate.bps);
    const daysLateBigInt = BigInt(daysLate);
    const numerator = overdueAmount.cents * bps * daysLateBigInt;
    const denominator = 3650000n;
    const penaltyCents = numerator / denominator;
    return Money.fromCents(penaltyCents, overdueAmount.currency);
  }
}
