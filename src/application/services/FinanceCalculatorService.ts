import { Money } from "../../domain/ledger/Money.ts";

export class FinanceCalculatorService {
  // حساب الفائدة البسيطة: (المبلغ * النسبة * المدة) / 100
  static calculateInterest(amount: Money, rate: number, months: number): Money {
    const interest = (amount.cents * BigInt(Math.floor(rate * 100)) * BigInt(months)) / 10000n;
    return new Money(interest, amount.currency);
  }

  // حساب غرامة التأخير (نسبة ثابتة على المبلغ المتأخر)
  static calculateLateFee(amount: Money, penaltyRate: number): Money {
    const penalty = (amount.cents * BigInt(Math.floor(penaltyRate * 100))) / 10000n;
    return new Money(penalty, amount.currency);
  }
}
